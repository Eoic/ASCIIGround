import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ASCIIRenderer, PerlinNoisePattern } from '../../index';
import { PatternControlsManager } from '../../demo/ui/config-generator';
import { DEBOUNCE_INTERVAL_MS } from '../../demo/ui/constants';

describe('Demo spacing controls', () => {
    let container: HTMLFormElement;
    let renderer: ASCIIRenderer;
    let manager: PatternControlsManager;

    const input = (id: string) => container.querySelector<HTMLInputElement>(`input[name="${id}"]`)!;
    const label = (id: string) => container.querySelector(`label[data-control-id="${id}"] .control-label`)!;

    const change = (id: string, value: string) => {
        const control = container.querySelector<HTMLInputElement>(`[name="${id}"]`)!;
        control.value = value;
        control.dispatchEvent(new Event('input', { bubbles: true }));
        vi.advanceTimersByTime(DEBOUNCE_INTERVAL_MS);
    };

    beforeEach(() => {
        vi.useFakeTimers();

        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function(this: HTMLCanvasElement) {
            return {
                font: '',
                measureText(this: CanvasRenderingContext2D, text: string) {
                    const size = parseFloat(this.font) || 12;
                    const width = text.includes('W') ? 0.9 : 0.51;
                    const family = this.font.includes('Arial') ? 1.1 : 1;
                    return { width: size * width * family, actualBoundingBoxAscent: size, actualBoundingBoxDescent: 0 };
                },
                clearRect: vi.fn(),
                fillRect: vi.fn(),
                fillText: vi.fn(),
            } as unknown as CanvasRenderingContext2D;
        });

        vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);
        container = document.createElement('form');
        document.body.appendChild(container);
        renderer = new ASCIIRenderer({ canvas: document.createElement('canvas'), pattern: new PerlinNoisePattern() });
        manager = new PatternControlsManager(container, renderer);
    });

    afterEach(() => {
        manager.destroy();
        container.remove();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('shows the configured integer spacing on load', () => {
        expect(Number.isInteger(renderer.region.charWidth)).toBe(false);
        for (const key of ['charSpacingX', 'charSpacingY'] as const) {
            expect(input(key).valueAsNumber).toBe(renderer.region[key]);
            expect(input(key).valueAsNumber).toBeGreaterThan(0);
            expect(renderer.options[key]).toBe(key === 'charSpacingX' ? 22 : 44);
            const expectedLabel = key === 'charSpacingX' ? 'Horizontal spacing' : 'Vertical spacing';
            expect(label(key).textContent).toBe(expectedLabel);
            expect(Number.isInteger(input(key).valueAsNumber)).toBe(true);
            expect(label(key).getAttribute('title')).toContain('Must be greater than 0.');
        }
    });

    it('keeps spacing fixed when font or characters change', () => {
        change('fontSize', '48');
        change('fontFamily', 'Arial');
        change('characters', 'W');
        expect(renderer.region.charSpacingX).toBe(22);
        expect(renderer.region.charSpacingY).toBe(44);
        expect(input('charSpacingX').valueAsNumber).toBe(22);
        expect(input('charSpacingY').valueAsNumber).toBe(44);
    });

    it.each(['charSpacingX', 'charSpacingY'] as const)('applies positive %s independently', (key) => {
        const otherKey = key === 'charSpacingX' ? 'charSpacingY' : 'charSpacingX';
        change(key, '25.5');
        expect(renderer.region[key]).toBe(25.5);
        expect(renderer.options[key]).toBe(25.5);
        expect(renderer.options[otherKey]).toBe(otherKey === 'charSpacingX' ? 22 : 44);
        change('fontSize', '60');
        expect(input(key).valueAsNumber).toBe(25.5);
    });

    it.each(['charSpacingX', 'charSpacingY'] as const)('rejects nonpositive and empty %s edits', (key) => {
        change(key, '25.5');
        for (const value of ['0', '-1', '', '1e309']) {
            input(key).focus();
            change(key, value);
            expect(input(key).validity.valid).toBe(false);
            expect(renderer.options[key]).toBe(25.5);
            expect(renderer.region[key]).toBe(25.5);
            input(key).blur();
            expect(input(key).valueAsNumber).toBe(25.5);
            expect(input(key).validity.valid).toBe(true);
        }
    });

    it('allows positive fractions after temporarily typing zero', () => {
        input('charSpacingX').focus();
        const initialSpacing = renderer.region.charSpacingX;
        change('charSpacingX', '0');
        expect(input('charSpacingX').value).toBe('0');
        expect(renderer.region.charSpacingX).toBe(initialSpacing);
        change('charSpacingX', '0.25');
        expect(input('charSpacingX').validity.valid).toBe(true);
        expect(renderer.region.charSpacingX).toBe(0.25);
        input('charSpacingX').blur();
        expect(input('charSpacingX').valueAsNumber).toBe(0.25);
    });

    it('shows the applied custom spacing when focus leaves before the update', () => {
        const spacingInput = input('charSpacingX');
        spacingInput.focus();
        spacingInput.value = '25.5';
        spacingInput.dispatchEvent(new Event('input', { bubbles: true }));
        spacingInput.blur();
        vi.advanceTimersByTime(DEBOUNCE_INTERVAL_MS);
        expect(spacingInput.valueAsNumber).toBe(25.5);
        expect(renderer.region.charSpacingX).toBe(25.5);
    });

    it('resynchronizes spacing after a pattern switch', () => {
        change('charSpacingX', '25');
        manager.switchPattern('rain');
        expect(input('charSpacingX').valueAsNumber).toBe(renderer.region.charSpacingX);
        expect(input('charSpacingX').valueAsNumber).toBeGreaterThan(0);
    });
});
