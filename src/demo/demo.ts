import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';
import { createPatternControls } from './ui/config-generator';
import { ASCIIRenderer } from '../rendering/ascii-renderer';

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
        const controlsManager = createPatternControls(controls, renderer);
        controls.classList.remove('hidden');
        controlsManager.switchPattern('perlin-noise');
    }

    function removeLoader(loader: HTMLElement) {
        loader.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', start);
})();
