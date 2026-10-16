import { Buffer } from 'node:buffer';
import console from 'node:console';
import { createHash } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import { URL } from 'node:url';

const registryUrl = 'https://registry.npmjs.org/asciiground';
const docsUrl = 'https://eoic.github.io/ASCIIGround/';

export async function verifyNpmRelease(version, { requireTag = true } = {}) {
    const metadata = await readJson(registryUrl);
    const publishedPackage = metadata.versions?.[version];
    const tag = version.includes('-') ? 'beta' : 'latest';

    if (!publishedPackage)
        throw new Error(`npm has not exposed asciiground@${version}`);

    if (requireTag && metadata['dist-tags']?.[tag] !== version)
        throw new Error(`npm has not exposed asciiground@${version} with the ${tag} tag`);

    const response = await request(publishedPackage.dist.tarball);
    const archive = await response.arrayBuffer();
    const integrity = `sha512-${createHash('sha512').update(Buffer.from(archive)).digest('base64')}`;

    if (integrity !== publishedPackage.dist.integrity)
        throw new Error(`The npm tarball for ${version} does not match its registry integrity`);
}

export async function verifyDocsRelease(version) {
    const manifestUrl = new URL('api/versions.json', docsUrl);
    const manifest = await readJson(manifestUrl);
    const release = manifest.versions.find(entry => entry.label === version);
    const releaseUrl = new URL(`versions/${version}/index.html`, docsUrl);

    if (!release || new URL(release.url, manifestUrl).href !== releaseUrl.href)
        throw new Error(`The live docs selector does not link to ${version}`);

    const response = await request(releaseUrl);
    const html = await response.text();

    if (!html.includes(`<title>ASCIIGround ${version}</title>`))
        throw new Error(`The live docs page does not contain version ${version}`);
}

export async function waitForPublication(check, { attempts = 60, intervalMs = 15000 } = {}) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            await check();
            return;
        } catch (error) {
            if (attempt === attempts)
                throw new Error(`Publication verification failed after ${attempts} attempts`, { cause: error });

            console.log(`Publication check ${attempt}/${attempts}: ${error.message}. Retrying.`);
            await setTimeout(intervalMs);
        }
    }
}

async function readJson(url) {
    const response = await request(url);
    return response.json();
}

async function request(url) {
    const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok)
        throw new Error(`${url} returned HTTP ${response.status}`);

    return response;
}
