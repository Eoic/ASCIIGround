import type { ASCIIRenderer, ASCIIRendererOptions } from '../../rendering/ascii-renderer';
import { ControlsRegistry, type PatternConstructor } from './controls/controls-registry';
import { DEBOUNCE_INTERVAL_MS } from './constants';

export type ControlValue = string | number | boolean | string[] | Record<string, string>;
export type ControlChangeCallback = (value: ControlValue) => void;

/**
 * Proxy wrapper that manages pattern instances and connects them with UI controls.
 * Provides real-time updates and pattern switching capabilities.
 */
export class PatternProxy {
    private _renderer: ASCIIRenderer | null = null;
    private _listeners: Map<string, ControlChangeCallback[]> = new Map();
    private _updateTimeout: number | null = null;
    private _pendingPatternUpdates: Record<string, ControlValue> = {};
    private _pendingRendererUpdates: Record<string, ControlValue> = {};

    constructor(renderer: ASCIIRenderer) {
        this._renderer = renderer;
        this._renderer.setOptions(ControlsRegistry.getRendererOptions());
    }

    /**
     * Get the current pattern ID.
     */
    public getCurrentPatternId(): string {
        return this._renderer!.pattern.id;
    }

    /**
     * Switch to a new pattern type by creating and setting a new pattern instance.
     */
    public switchPattern(patternId: string): void {
        if (this._renderer!.pattern.id === patternId) {
            console.warn(`Pattern "${patternId}" is already active.`);
            return;
        }

        const [PatternConstructor, defaultOptions] = this._getPattern(patternId);
        this._renderer!.pattern = new PatternConstructor(defaultOptions);
        this._renderer!.setOptions(ControlsRegistry.getRendererOptions());
        this._renderer!.render();
    }

    public destroy(): void {
        this._listeners.clear();
        this._renderer?.destroy();
        this._renderer = null;
        this._pendingPatternUpdates = {};
        this._pendingRendererUpdates = {};

        if (this._updateTimeout !== null) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
    }

    /**
     * Update a specific property of the current pattern.
     */
    private _updatePatternProperty(propertyName: string, value: ControlValue): void {
        this._pendingPatternUpdates[propertyName] = value;
        this._scheduleUpdate();
    }

    /**
     * Update renderer options in real-time.
     */
    private _updateRendererProperty(propertyName: string, value: ControlValue): void {
        this._pendingRendererUpdates[propertyName] = value;
        this._scheduleUpdate();
    }

    /**
     * Schedule a debounced update that processes all pending changes at once.
     */
    private _scheduleUpdate(): void {
        if (this._updateTimeout !== null) 
            clearTimeout(this._updateTimeout);

        this._updateTimeout = window.setTimeout(() => {
            this._processPendingUpdates();
            this._updateTimeout = null;
        }, DEBOUNCE_INTERVAL_MS);
    }

    /**
     * Process all pending updates in an optimized way.
     */
    private _processPendingUpdates(): void {
        const hasPatternUpdates = Object.keys(this._pendingPatternUpdates).length > 0;
        const hasRendererUpdates = Object.keys(this._pendingRendererUpdates).length > 0;

        if (!hasPatternUpdates && !hasRendererUpdates) 
            return;

        if (hasPatternUpdates) 
            this._updatePattern();
        
        if (hasRendererUpdates) 
            this._updateRenderer();
        
        this._pendingPatternUpdates = {};
        this._pendingRendererUpdates = {};
        
        if (!this._renderer!.isAnimating) 
            requestAnimationFrame(() => this._renderer!.render());
    }

    /**
     * Update pattern with accumulated changes.
     */
    private _updatePattern(): void {
        const processedUpdates: Record<string, unknown> = {};

        Object.entries(this._pendingPatternUpdates).forEach(([key, value]) => {
            let processedValue = value;

            if (key === 'characters' && typeof value === 'string')
                processedValue = Array.from(value);

            processedUpdates[key] = processedValue;
        });

        if (typeof this._renderer!.pattern.setOptions === 'function') 
            this._renderer!.pattern.setOptions(processedUpdates);
        else {
            const currentOptions = { ...this._renderer!.pattern.options, ...processedUpdates };
            const patternId = this._renderer!.pattern.id;
            const [PatternConstructor] = this._getPattern(patternId);

            if (!PatternConstructor) {
                console.warn(`Cannot update pattern "${patternId}".`);
                return;
            }

            this._renderer!.pattern = new PatternConstructor(currentOptions);
        }
    }

    /**
     * Update renderer with accumulated changes.
     */
    private _updateRenderer(): void {
        const pendingUpdates = this._pendingRendererUpdates as Partial<ASCIIRendererOptions>;
        this._renderer!.setOptions(pendingUpdates);
    }

    /**
     * Handle any control change by routing to appropriate update method.
     */
    public handleControlChange(controlCategory: string, controlId: string, value: ControlValue): void {
        switch (controlCategory) {
            case 'renderer':
                this._updateRendererProperty(controlId, value);
                break;
            case 'pattern':
                this._updatePatternProperty(controlId, value);
                break;
        }

        this._emitChange(controlId, value);
    }

    public getRendererOptions(): Record<string, ControlValue> {
        const options = this._renderer!.options;
        const result: Record<string, ControlValue> = {};
        Object.entries(options).forEach(([key, value]) => result[key] = value as ControlValue);

        return result;
    }

    /**
     * Return options of the active pattern for UI synchronization.
     * One could just return the pattern's options directly, but this method
     * allows for future flexibility if we need to transform or filter options.
     */
    public getPatternOptions(): Record<string, ControlValue> {
        const options = this._renderer!.pattern.options;
        const result: Record<string, ControlValue> = {};
        Object.entries(options).forEach(([key, value]) => result[key] = value as ControlValue);
        return result;
    }

    /**
     * Get the pattern constructor based on the pattern ID from the registry.
     */
    private _getPattern(patternId: string): [PatternConstructor, Record<string, unknown>] {
        const patternControls = ControlsRegistry.getPatternControls(patternId);
        return [patternControls.pattern, ControlsRegistry.getPatternOptions(patternId)];
    }

    /**
     * Notify all listeners about a control value change.
     */
    private _emitChange(controlId: string, value: ControlValue): void {
        const listeners = this._listeners.get(controlId) || [];
        listeners.forEach(callback => callback(value));
    }

    /**
     * Clean up any pending timeouts and resources.
     * Should be called when the proxy is no longer needed.
     */
    public dispose(): void {
        if (this._updateTimeout !== null) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }

        this._pendingPatternUpdates = {};
        this._pendingRendererUpdates = {};
        this._listeners.clear();
    }
}
