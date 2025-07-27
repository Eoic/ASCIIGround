import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';
import { createPatternControls } from './ui/config-generator';
import { ASCIIRenderer } from '../rendering/ascii-renderer';

(() => {
    function start() {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const renderer = new ASCIIRenderer(canvas);
        const loader = document.getElementById('loader') as HTMLElement;
        const controls = document.getElementById('controls') as HTMLFormElement;

        document.body.appendChild(canvas);
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
