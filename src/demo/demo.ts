import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';
import { createPatternControls } from './ui/config-generator';
import { ASCIIRenderer } from '../rendering/ascii-renderer';
import { DEBUG_INFO_UPDATE_INTERVAL_MS } from './ui/constants';

(() => {
    function start() {
        let canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement | null;

        if (!canvas)
            canvas = document.createElement('canvas');

        let canvasContainer = document.getElementById('canvas-container') as HTMLDivElement | null;

        if (!canvasContainer) {
            canvasContainer = document.createElement('div');
            canvasContainer.id = 'canvas-container';
            canvasContainer.appendChild(canvas);
            document.body.appendChild(canvasContainer);
        }

        const renderer = new ASCIIRenderer({ canvas, options: { resizeTo: canvasContainer } });
        const loader = document.getElementById('loader') as HTMLElement;
        const controls = document.getElementById('controls') as HTMLFormElement;
        handleControls(controls, renderer);
        removeLoader(loader);
    }

    function handleControls(controls: HTMLFormElement, renderer: ASCIIRenderer) {
        const controlsForm = document.getElementById('controls-tab') as HTMLFormElement;
        const controlsManager = createPatternControls(controlsForm, renderer);
        setupTabSwitching();
        setupDebugInfo(renderer);
        controls.classList.remove('hidden');
        controlsManager.switchPattern('perlin-noise');
    }

    function setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                tabButtons.forEach((btn) => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');

                const targetContent = document.getElementById(targetTab!);

                if (targetContent)
                    targetContent.classList.add('active');
            });
        });
    }

    function buildDebugInfo(container: HTMLElement, data: Record<string, string>) {
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (const [key, value] of Object.entries(data)) {
            const keyText = document.createElement('strong');
            const valueText = document.createElement('span');
            keyText.innerText = key;
            valueText.innerText = value;
            fragment.appendChild(keyText);
            fragment.appendChild(valueText);
        }

        container.appendChild(fragment);
    }

    function setupDebugInfo(renderer: ASCIIRenderer) {
        const debugContainer = document.querySelector('#debug-tab .debug-info') as HTMLElement;

        if (!debugContainer)
            return;

        function updateDebugInfo() {
            const renderInfo = renderer.renderInfo;
            const mouseInfo = renderer.mouseInfo;

            buildDebugInfo(debugContainer, {
                'FPS': renderInfo.fps.toFixed(2),
                'Frame count': String(renderInfo.frameCount),
                'Rows': String(renderInfo.rows),
                'Columns': String(renderInfo.columns),
                'Total symbols': String(renderInfo.rows * renderInfo.columns),
                'Mouse position': `(${mouseInfo.x}, ${mouseInfo.y})`,
            });
        }

        setInterval(updateDebugInfo, DEBUG_INFO_UPDATE_INTERVAL_MS);
        updateDebugInfo();
    }

    function removeLoader(loader: HTMLElement) {
        loader.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', start);
})();
