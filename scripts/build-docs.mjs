import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';
import { listPublishedVersions, preparePublishedPackage } from './docs/published-package.mjs';

const siteDirectory = resolve('docs');
const typedocConfig = resolve('typedoc.json');
const typedocExecutable = resolve('node_modules/typedoc/bin/typedoc');

async function buildDocumentation(includePublishedVersions) {
    const workspace = await mkdtemp(join(tmpdir(), 'asciiground-docs-'));

    try {
        const development = { label: 'Development', directory: join(siteDirectory, 'api') };
        await renderDocumentation({ name: 'ASCIIGround (Development)' }, development.directory, workspace);

        const versions = [development];

        if (includePublishedVersions) {
            for (const version of listPublishedVersions(process.env.DOCS_RELEASE_VERSION))
                versions.push(await buildPublishedVersion(version, workspace));
        }

        await writeVersionManifests(versions);
    } finally {
        await rm(workspace, { recursive: true, force: true });
    }
}

async function buildPublishedVersion(version, workspace) {
    const publishedPackage = await preparePublishedPackage(version, workspace);
    const outputDirectory = join(siteDirectory, 'versions', version);

    await renderDocumentation({
        name: `ASCIIGround ${version}`,
        entryPoints: [publishedPackage.entryPoint],
        readme: publishedPackage.readme,
        tsconfig: publishedPackage.tsconfig,
        basePath: publishedPackage.directory,
        disableSources: true,
    }, outputDirectory, workspace);

    return { label: version, directory: outputDirectory };
}

async function renderDocumentation(options, outputDirectory, workspace) {
    const configPath = join(workspace, 'typedoc.json');

    const config = {
        extends: typedocConfig,
        includeVersion: false,
        ...options,
        out: outputDirectory,
    };

    await writeFile(configPath, JSON.stringify(config, null, 4));
    execFileSync(process.execPath, [typedocExecutable, '--options', configPath], { stdio: 'inherit' });
}

async function writeVersionManifests(versions) {
    for (const current of versions) {
        const manifest = {
            current: current.label,
            versions: versions.map(version => ({
                label: version.label,
                url: relativeIndexUrl(current.directory, version.directory),
            })),
        };

        const manifestPath = join(current.directory, 'versions.json');
        await writeFile(manifestPath, JSON.stringify(manifest, null, 4));
    }
}

function relativeIndexUrl(fromDirectory, toDirectory) {
    const relativeDirectory = relative(fromDirectory, toDirectory).replaceAll('\\', '/') || '.';
    return `${relativeDirectory}/index.html`;
}

await buildDocumentation(process.argv.includes('--versions'));
