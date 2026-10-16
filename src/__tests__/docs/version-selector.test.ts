import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';

const script = readFileSync('scripts/docs/version-selector.js', 'utf8');

afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

describe('Documentation version selector', () => {
    it.each([
        {
            current: 'Development',
            asset: 'https://example.com/ASCIIGround/api/assets/custom.js',
            manifest: 'https://example.com/ASCIIGround/api/versions.json',
            development: './index.html',
            release: '../versions/1.4.0/index.html',
        },
        {
            current: '1.4.0',
            asset: 'https://example.com/ASCIIGround/versions/1.4.0/assets/custom.js',
            manifest: 'https://example.com/ASCIIGround/versions/1.4.0/versions.json',
            development: '../../api/index.html',
            release: './index.html',
        }
    ])('navigates from $current docs using the asset location', async (version) => {
        document.body.innerHTML = '<main class="col-content"><h1>ASCIIGround</h1></main>';

        const currentScript = document.createElement('script');
        currentScript.src = version.asset;
        vi.spyOn(document, 'currentScript', 'get').mockReturnValue(currentScript);

        const assign = vi.fn();
        const fetch = vi.fn<(url: URL) => Promise<unknown>>().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                current: version.current,
                versions: [
                    { label: 'Development', url: version.development },
                    { label: '1.4.0', url: version.release }
                ],
            }),
        });

        runInNewContext(script, { document, fetch, URL, window: { location: { assign } }, console });

        await vi.waitFor(() => expect(document.querySelector('select')).not.toBeNull());
        expect(fetch.mock.calls[0][0].href).toBe(version.manifest);

        const select = document.querySelector('select')!;
        expect(select.getAttribute('aria-label')).toBe('Documentation version');
        expect(select.selectedOptions[0].textContent).toBe(version.current);
        select.selectedIndex = version.current === 'Development' ? 1 : 0;
        select.dispatchEvent(new Event('change'));

        const destination = version.current === 'Development' ? 'versions/1.4.0' : 'api';
        expect(assign).toHaveBeenCalledWith(`https://example.com/ASCIIGround/${destination}/index.html`);
        expect(document.querySelector('h1')?.textContent).toBe('ASCIIGround');
    });
});
