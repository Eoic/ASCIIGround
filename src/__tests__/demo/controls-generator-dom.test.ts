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

        const charInput = container.querySelector<HTMLInputElement>(
            'label[data-control-id="colorMap"] .color-map-char'
        )!;
        const colorInput = container.querySelector<HTMLInputElement>(
            'label[data-control-id="colorMap"] .color-map-color'
        )!;

        charInput.value = '#';
        charInput.dispatchEvent(new Event('input', { bubbles: true }));
        colorInput.value = '#ff0000';
        colorInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(callback).toHaveBeenLastCalledWith({ '#': '#ff0000' });
        expect(generator.getControlValue('colorMap')).toEqual({ '#': '#ff0000' });
    });

    it('validates numeric limits and restores the last accepted value on blur', () => {
        const callback = vi.fn();
        generator.onControlChange('fontSize', callback);
        const input = container.querySelector<HTMLInputElement>('input[name="fontSize"]')!;
        generator.setControlValue('fontSize', 40);

        for (const value of ['', '0', '73', '20.5']) {
            input.focus();
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            expect(input.validity.valid).toBe(false);
            expect(callback).not.toHaveBeenCalled();
            input.blur();
            expect(input.valueAsNumber).toBe(40);
            expect(input.validity.valid).toBe(true);
        }

        input.value = '24';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(callback).toHaveBeenCalledWith(24);
        input.focus();
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.blur();
        expect(input.valueAsNumber).toBe(24);
    });

    it('allows zero when a numeric control declares an inclusive minimum', () => {
        const callback = vi.fn();
        generator.onControlChange('padding', callback);
        const input = container.querySelector<HTMLInputElement>('input[name="padding"]')!;
        input.value = '0';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(callback).toHaveBeenCalledWith(0);
        expect(input.validity.valid).toBe(true);
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

