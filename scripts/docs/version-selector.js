(() => {
    async function initializeVersionSelector(manifestUrl) {
        const content = document.querySelector('.col-content');

        if (!content)
            return;

        const manifest = await loadVersionManifest(manifestUrl);
        content.prepend(createVersionSelector(manifest, manifestUrl));
    }

    async function loadVersionManifest(manifestUrl) {
        const response = await fetch(manifestUrl);

        if (!response.ok)
            throw new Error(`Cannot load documentation versions: ${response.status}`);

        return response.json();
    }

    function createVersionSelector(manifest, manifestUrl) {
        const select = document.createElement('select');
        select.setAttribute('aria-label', 'Documentation version');
        select.addEventListener('change', () => window.location.assign(select.value));

        for (const version of manifest.versions)
            select.append(createVersionOption(version, manifest.current, manifestUrl));

        const label = document.createElement('label');
        label.className = 'docs-version';
        label.textContent = 'Documentation version ';
        label.append(select);
        return label;
    }

    function createVersionOption(version, currentVersion, manifestUrl) {
        const option = document.createElement('option');
        option.textContent = version.label;
        option.value = new URL(version.url, manifestUrl).href;
        option.selected = version.label === currentVersion;
        return option;
    }

    const manifestUrl = new URL('../versions.json', document.currentScript.src);
    initializeVersionSelector(manifestUrl).catch(error => console.error(error));
})();
