import { execFileSync } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { URL } from 'node:url';

const stableVersionPattern = /^\d+\.\d+\.\d+$/;
const relativeMarkdownLinkPattern = /\]\((\.\.?\/[^\s)]+)\)/g;

export function listPublishedVersions() {
    const versions = runNpmJson(['view', 'asciiground', 'versions']);
    return versions.filter(version => stableVersionPattern.test(version)).reverse();
}

export async function preparePublishedPackage(version, workspace) {
    const directory = await downloadPackage(version, workspace);
    const metadataPath = join(directory, 'package.json');
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));

    if (metadata.name !== 'asciiground' || metadata.version !== version)
        throw new Error(`Unexpected package metadata for ${version}`);

    const readme = join(directory, 'README.md');
    const tsconfig = join(directory, 'tsconfig.json');
    await resolveReadmeLinks(readme, version);
    await writeDeclarationConfig(tsconfig);
    return { directory, entryPoint: join(directory, metadata.types), readme, tsconfig };
}

async function downloadPackage(version, workspace) {
    const [archive] = runNpmJson([
        'pack',
        `asciiground@${version}`,
        '--ignore-scripts',
        '--pack-destination',
        workspace
    ]);

    const packageDirectory = join(workspace, 'package');
    const archivePath = join(workspace, archive.filename);

    await rm(packageDirectory, { recursive: true, force: true });
    execFileSync('tar', ['-xzf', archivePath, '-C', workspace]);
    return packageDirectory;
}

async function resolveReadmeLinks(readmePath, version) {
    const revision = runNpmJson(['view', `asciiground@${version}`, 'gitHead']) || `v${version}`;
    const sourceUrl = `https://github.com/Eoic/ASCIIGround/blob/${revision}/`;
    const markdown = await readFile(readmePath, 'utf8');

    const resolvedMarkdown = markdown.replace(relativeMarkdownLinkPattern, (_, relativePath) => {
        const absoluteUrl = new URL(relativePath, sourceUrl);
        return `](${absoluteUrl.href})`;
    });

    await writeFile(readmePath, resolvedMarkdown);
}

async function writeDeclarationConfig(configPath) {
    const config = {
        compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            strict: true,
            skipLibCheck: true,
            types: [],
        },
        include: ['dist/**/*.ts'],
    };

    await writeFile(configPath, JSON.stringify(config, null, 4));
}

function runNpmJson(npmArguments) {
    const output = execFileSync('npm', [...npmArguments, '--json'], { encoding: 'utf8' });
    return output.trim() ? JSON.parse(output) : undefined;
}
