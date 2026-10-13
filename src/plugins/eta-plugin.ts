import { Eta } from 'eta';
import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface EtaPluginOptions {
    styles: string[];
    scripts: string[];
    isDev?: boolean;
}

export function etaPlugin(options: EtaPluginOptions): Plugin {
    const eta = new Eta({
        autoEscape: false,
        useWith: true,
    });

    return {
        name: 'eta-template',
        enforce: 'pre' as const,

        resolveId(id: string) {
            if (id.endsWith('.eta'))
                return id;
        },

        load(id: string) {
            if (id.endsWith('.eta')) {
                const template = readFileSync(id, 'utf-8');

                return {
                    code: `export default ${JSON.stringify(template)};`,
                    map: null,
                };
            }
        },

        configureServer(server) {
            if (options.isDev) {
                const templatePath = resolve(import.meta.dirname, '../demo/index.eta');

                server.watcher.add(templatePath);

                server.watcher.on('change', (file) => {
                    if (file === templatePath) {
                        console.log('Template file changed, triggering reload...');
                        server.ws.send({ type: 'full-reload' });
                    }
                });

                server.middlewares.use('/', (req, res, next) => {
                    if (req.url === '/' || req.url === '/index.html') {
                        try {
                            const template = readFileSync(templatePath, 'utf-8');
                            const devStyles = options.isDev ? [] : options.styles;

                            const rendered = eta.renderString(template, {
                                styles: devStyles,
                                scripts: options.scripts,
                            });

                            res.setHeader('Content-Type', 'text/html');
                            res.end(rendered);
                            return;
                        } catch (error) {
                            console.error('Error rendering template:', error);
                        }
                    }

                    next();
                });
            }
        },

        generateBundle(_, bundle) {
            if (!options.isDev) {
                const mainChunk = Object.values(bundle).find(chunk => chunk.type === 'chunk' && chunk.name === 'main');

                if (mainChunk && mainChunk.type === 'chunk') {
                    const template = readFileSync(resolve(import.meta.dirname, '../demo/index.eta'), 'utf-8');

                    const rendered = eta.renderString(template, {
                        styles: options.styles,
                        scripts: options.scripts,
                    });

                    delete bundle[mainChunk.fileName];

                    this.emitFile({
                        type: 'asset',
                        fileName: 'index.html',
                        source: rendered,
                    });
                }
            }
        },
    };
}
