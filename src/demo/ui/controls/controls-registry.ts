/**
 * Control types and specifications for dynamic UI generation.
 */

import { controls as perlinControls } from './perlin-noise-control';
import { controls as rendererControls } from './renderer-control';
import { controls as dummyControls } from './dummy-control';
import { controls as staticControls } from './static-control';
import { controls as rainControls } from './rain-control';
import { PerlinNoisePattern } from '../../../patterns/perlin-noise-pattern';
import { DummyPattern } from '../../../patterns/dummy-pattern';
import { RainPattern } from '../../../patterns/rain-pattern';
import type { Pattern } from '../../../patterns/pattern';
import type { ControlValue } from '../pattern-proxy';
import { StaticNoisePattern } from '../../../patterns/static-noise-pattern';

export type PatternConstructor = new (options?: Record<string, unknown>) => Pattern;

export interface ControlSpec {
    id: string;
    min?: number;
    max?: number;
    step?: number;
    label: string;
    description?: string;
    value: string | number | boolean;
    category: 'renderer' | 'pattern';
    options?: Array<{ value: string | number | boolean; label: string }>;
    type: 'number' | 'text' | 'color' | 'select' | 'range' | 'checkbox' | 'textarea';
    outType: 'string' | 'number' | 'boolean' | 'array';
    visibleOn?: Array<{ [key: string]: string | number | boolean }>;
}

export interface PatternControlConfig {
    label: string;
    controls: ControlSpec[];
    pattern: PatternConstructor;
}

export interface RendererControlConfig {
    label: string;
    controls: ControlSpec[];
}

/**
 * Registry of all control configurations for different patterns and renderer options.
 */
export class ControlsRegistry {
    private static readonly _RENDERER_CONTROLS: RendererControlConfig = rendererControls;

    private static readonly _PATTERN_CONTROLS: Record<string, PatternControlConfig> = {
        [DummyPattern.ID]: dummyControls,
        [PerlinNoisePattern.ID]: perlinControls,
        [StaticNoisePattern.ID]: staticControls,
        [RainPattern.ID]: rainControls,
    };

    /**
     * Get renderer controls configuration.
     */
    public static getRendererControls(): RendererControlConfig {
        return this._RENDERER_CONTROLS;
    }

    /**
     * Get controls configuration for a specific pattern.
     */
    public static getPatternControls(patternType: string): PatternControlConfig {
        if (!this._PATTERN_CONTROLS[patternType])
            throw new Error(`Pattern controls for "${patternType}" not found.`);

        return this._PATTERN_CONTROLS[patternType];
    }

    /**
     * Get control specification by ID.
     */
    public static getControlSpec(id: string): ControlSpec | null {
        const rendererControl = this._RENDERER_CONTROLS.controls.find((control) => control.id === id);

        if (rendererControl)
            return rendererControl;

        for (const patternConfig of Object.values(this._PATTERN_CONTROLS))
            return patternConfig.controls.find((control) => control.id === id) ?? null;

        return null;
    }

    /**
     * Get all control specifications across all patterns and renderer.
     */
    public static getAllControlsSpecs(): ControlSpec[] {
        const specs: ControlSpec[] = [...this._RENDERER_CONTROLS.controls];

        for (const patternConfig of Object.values(this._PATTERN_CONTROLS)) 
            specs.push(...patternConfig.controls);

        return specs;
    }

    public static parseOutType(
        value: ControlSpec['value'],
        outType: 'string' | 'number' | 'boolean' | 'array'
    ): ControlValue {
        switch (outType) {
            case 'string':
                return String(value);
            case 'number':
                return Number(value);
            case 'boolean':
                return Boolean(value);
            case 'array':
                return Array.from(String(value));
            default:
                throw new Error('Unknown outType!');
        }
    }

    /**
     * Get pattern options for a specific pattern type.
     */
    public static getPatternOptions(patternType: string): Record<string, ControlValue> {
        const patternConfig = this.getPatternControls(patternType);

        return patternConfig.controls.reduce((options, control) => {
            options[control.id] = ControlsRegistry.parseOutType(control.value, control.outType);
            return options;
        }, {} as Record<string, ControlValue>);
    }

    /**
     * Get renderer options.
     */
    public static getRendererOptions(): Record<string, ControlValue> {
        return this._RENDERER_CONTROLS.controls.reduce((options, control) => {
            options[control.id] = control.value;
            return options;
        }, {} as Record<string, ControlValue>);
    }

    /**
     * Get all available pattern types.
     */
    public static getAvailablePatterns(): Array<{ value: string; label: string }> {
        return Object.entries(this._PATTERN_CONTROLS).map(([key, config]) => ({
            value: key,
            label: config.label,
        }));
    }
}
