import { ASCIIRenderer, PerlinNoisePattern } from '../index';

const canvas = document.querySelector<HTMLCanvasElement>('#ascii-bg');

if (canvas) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listeners = new AbortController();

    const renderer = new ASCIIRenderer({
        canvas,
        pattern: new PerlinNoisePattern({
            characters: [' ', '.', ':', '+', '*', '#', '@'],
            frequency: 0.045,
            octaves: 3,
            seed: 42,
        }),
        options: {
            fontSize: 14,
            charSpacingX: 12,
            charSpacingY: 18,
            color: '#7161ef',
            colorMap: {
                '.': '#4f5b8f',
                ':': '#6265b2',
                '+': '#7161ef',
                '*': '#7e75d9',
                '#': '#4f8df7',
                '@': '#8aacf0',
            },
            backgroundColor: '#292929',
            animationSpeed: 120,
        },
    });

    const syncAnimation = () => {
        const shouldAnimate = !reducedMotion.matches && !document.hidden;

        if (shouldAnimate && !renderer.isAnimating)
            renderer.startAnimation();
        else if (!shouldAnimate && renderer.isAnimating)
            renderer.stopAnimation();
    };

    renderer.resize();
    syncAnimation();

    reducedMotion.addEventListener('change', syncAnimation, { signal: listeners.signal });
    document.addEventListener('visibilitychange', syncAnimation, { signal: listeners.signal });
    window.addEventListener('pageshow', syncAnimation, { signal: listeners.signal });

    window.addEventListener('pagehide', (event) => {
        renderer.stopAnimation();

        if (!event.persisted) {
            renderer.destroy();
            listeners.abort();
        }
    }, { signal: listeners.signal });
}
