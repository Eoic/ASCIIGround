import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ControlsGenerator } from '../../demo/ui/controls-generator';

// Tests focused on real DOM interactions for ControlsGenerator

describe('ControlsGenerator DOM integration', () => {
    let container: HTMLFormElement;
    let generator: ControlsGenerator;

    beforeEach(() => {
        container = document.createElement('form');
        document.body.appendChild(container);
        generator = new ControlsGenerator(container);
        generator.generatePatternControls('dummy');
    });

    afterEach(() => {
        generator.destroy();
        container.remove();
    });

    it('should handle color map editing and emit changes', () => {
        const callback = vi.fn();
        generator.onControlChange('colorMap', callback);

        const addBtn = container.querySelector('label[data-control-id="colorMap"] .color-map-add') as HTMLButtonElement;
        addBtn.click();

        const charInput = container.querySelector('label[data-control-id="colorMap"] .color-map-char') as HTMLInputElement;
        const colorInput = container.querySelector('label[data-control-id="colorMap"] .color-map-color') as HTMLInputElement;

        charInput.value = '#';
        charInput.dispatchEvent(new Event('input', { bubbles: true }));
        colorInput.value = '#ff0000';
        colorInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(callback).toHaveBeenLastCalledWith({ '#': '#ff0000' });
        expect(generator.getControlValue('colorMap')).toEqual({ '#': '#ff0000' });
    });

    it('should toggle conditional control visibility', () => {
        const animatedInput = container.querySelector('input[data-control-id="animated"]') as HTMLInputElement;
        const speedLabel = container.querySelector('label[data-control-id="animationSpeed"]')!;
        expect(speedLabel.classList.contains('hidden')).toBe(true);

        animatedInput.checked = true;
        animatedInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(speedLabel.classList.contains('hidden')).toBe(false);
    });
});

