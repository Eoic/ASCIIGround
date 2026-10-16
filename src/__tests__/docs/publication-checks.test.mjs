import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import console from 'node:console';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { listPublishedVersions } from '../../../scripts/docs/published-package.mjs';
import {
    verifyDocsRelease,
    verifyNpmRelease,
    waitForPublication
} from '../../../scripts/release/publication-checks.mjs';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }));

const version = '1.5.0';
const tarball = 'https://registry.npmjs.org/asciiground/-/asciiground-1.5.0.tgz';
const archive = Buffer.from('packed release');
const integrity = `sha512-${createHash('sha512').update(archive).digest('base64')}`;

function mockResponses(...responses) {
    const fetch = vi.fn();
    for (const response of responses)
        fetch.mockResolvedValueOnce({ ok: true, ...response });

    vi.stubGlobal('fetch', fetch);
    return fetch;
}

function jsonResponse(data) {
    return { json: () => Promise.resolve(data) };
}

function packageMetadata(tagVersion = version, releaseVersion = version) {
    return {
        'dist-tags': { latest: tagVersion, beta: tagVersion },
        versions: { [releaseVersion]: { dist: { tarball, integrity } } },
    };
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('Release publication checks', () => {
    it('waits through a stale registry response before accepting the package', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const fetch = mockResponses(
            jsonResponse({ versions: {}, 'dist-tags': { latest: '1.4.0' } }),
            jsonResponse(packageMetadata()),
            { arrayBuffer: () => Promise.resolve(archive) }
        );

        await waitForPublication(() => verifyNpmRelease(version), { attempts: 2, intervalMs: 0 });

        expect(fetch).toHaveBeenCalledTimes(3);
        expect(fetch.mock.calls[2][0]).toBe(tarball);
    });

    it('rejects a stale latest tag even when the package metadata exists', async () => {
        mockResponses(jsonResponse(packageMetadata('1.4.0')));
        await expect(verifyNpmRelease(version)).rejects.toThrow('latest tag');
    });

    it('checks the beta tag for prereleases', async () => {
        const beta = '1.6.0-beta.0';
        mockResponses(jsonResponse(packageMetadata(beta, beta)), {
            arrayBuffer: () => Promise.resolve(archive),
        });
        await expect(verifyNpmRelease(beta)).resolves.toBeUndefined();
    });

    it('allows rebuilding older package docs without moving the latest tag', async () => {
        mockResponses(jsonResponse(packageMetadata('1.6.0')), {
            arrayBuffer: () => Promise.resolve(archive),
        });
        await expect(verifyNpmRelease(version, { requireTag: false })).resolves.toBeUndefined();
    });

    it('rejects a missing tarball after publication was acknowledged', async () => {
        mockResponses(jsonResponse(packageMetadata()), { ok: false, status: 404 });
        await expect(verifyNpmRelease(version)).rejects.toThrow('HTTP 404');
    });

    it('rejects a tarball with incorrect contents', async () => {
        mockResponses(jsonResponse(packageMetadata()), {
            arrayBuffer: () => Promise.resolve(Buffer.from('wrong package')),
        });
        await expect(verifyNpmRelease(version)).rejects.toThrow('integrity');
    });

    it('fails after bounded retries when the registry stays stale', async () => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        const check = vi.fn().mockRejectedValue(new Error('not visible'));

        await expect(waitForPublication(check, { attempts: 3, intervalMs: 0 }))
            .rejects.toThrow('failed after 3 attempts');
        expect(check).toHaveBeenCalledTimes(3);
    });

    it('rejects a successful deployment that omitted the version', async () => {
        mockResponses(jsonResponse({ versions: [{ label: '1.4.0', url: '../versions/1.4.0/index.html' }] }));
        await expect(verifyDocsRelease(version)).rejects.toThrow('selector does not link');
    });

    it.each([
        { ok: false, status: 404 },
        { text: () => Promise.resolve('<title>ASCIIGround (Development)</title>') }
    ])('rejects a version link without its matching page', async (pageResponse) => {
        mockResponses(jsonResponse({ versions: [{ label: version, url: `../versions/${version}/index.html` }] }),
            pageResponse);
        await expect(verifyDocsRelease(version)).rejects.toThrow();
    });

    it('accepts a live selector and matching release page', async () => {
        mockResponses(jsonResponse({ versions: [{ label: version, url: `../versions/${version}/index.html` }] }), {
            text: () => Promise.resolve(`<title>ASCIIGround ${version}</title>`),
        });
        await expect(verifyDocsRelease(version)).resolves.toBeUndefined();
    });
});

describe('Required docs version', () => {
    it('fails the build when npm omits the required stable release', () => {
        vi.mocked(execFileSync).mockReturnValue('["1.4.0"]');
        expect(() => listPublishedVersions(version)).toThrow('Cannot deploy docs without');
    });

    it('preserves stable version ordering when the required release is present', () => {
        vi.mocked(execFileSync).mockReturnValue('["1.4.0", "1.5.0", "1.6.0-beta.0"]');
        expect(listPublishedVersions(version)).toEqual(['1.5.0', '1.4.0']);
    });
});
