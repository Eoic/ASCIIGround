import type { ASCIIRenderer } from '../../rendering/ascii-renderer';
import { ControlsGenerator } from './controls-generator';
import { PatternProxy, type ControlValue } from './pattern-proxy';
import { ControlsRegistry } from './controls/controls-registry';

/**
 * Main control manager that orchestrates dynamic pattern controls and real-time updates.
 * This is the primary interface for managing pattern controls in the demo page.
 */
export class PatternControlsManager {
    private _patternProxy: PatternProxy | null;
    private _controlsGenerator: ControlsGenerator | null;

    constructor(controlsContainer: HTMLFormElement, renderer: ASCIIRenderer) {
        this._controlsGenerator = new ControlsGenerator(controlsContainer);
        this._patternProxy = new PatternProxy(renderer);
        const currentPatternId = this._patternProxy.getCurrentPatternId();
        this._controlsGenerator.generatePatternControls(currentPatternId);
        this._setupEventListeners();
        this._synchronizeUI();
    }

    /**
     * Switch to a different pattern type.
     */
    public switchPattern(patternId: string): void {
        this._handlePatternChange(patternId);
    }

    /**
     * Add custom control change listener.
     */
    public onControlChange(controlId: string, callback: (value: ControlValue) => void): void {
        this._controlsGenerator!.onControlChange(controlId, callback);
    }

    /**
     * Remove custom control change listener.
     */
    public destroy(): void {
        if (this._patternProxy)
            this._removeControlChangeListeners();

        this._patternProxy?.destroy();
        this._controlsGenerator?.destroy();
        this._patternProxy = null;
        this._controlsGenerator = null;
    }

    /**
     * Setup event listeners between UI and pattern proxy.
     */
    private _setupEventListeners(): void {
        this._addControlChangeListeners();

        this._controlsGenerator!
            .onControlChange('pattern', (value: ControlValue) => this._handlePatternChange(String(value)));

        ControlsRegistry.getRendererControls().controls.forEach((control) => {
            this._controlsGenerator!.onControlChange((control.id), (value: ControlValue) => {
                this._patternProxy!.handleControlChange(control.category, control.id, value);
            });
        }); 
    }

    /**
     * Setup listeners for all control types.
     */
    private _addControlChangeListeners(): void {
        const currentPatternId = this._patternProxy!.getCurrentPatternId();
        const patternConfig = ControlsRegistry.getPatternControls(currentPatternId);

        patternConfig.controls.forEach((control) => {
            this._controlsGenerator!.onControlChange((control.id), (value) => {
                this._patternProxy!.handleControlChange(control.category, control.id, value);
            });
        });
    }

    /**
     * Remove all control change listeners from the active pattern.
     */
    private _removeControlChangeListeners(): void {
        const currentPatternId = this._patternProxy!.getCurrentPatternId();
        const patternConfig = ControlsRegistry.getPatternControls(currentPatternId);

        patternConfig.controls.forEach((control) => {
            this._controlsGenerator!.offControlChange((control.id));
        });
    }

    /**
     * Handle pattern type change by regenerating controls and updating the pattern.
     * @param patternType - the new pattern type to switch to.
     */
    private _handlePatternChange(patternType: string): void {
        this._removeControlChangeListeners();
        this._patternProxy!.switchPattern(patternType);
        this._controlsGenerator!.generatePatternControls(patternType);
        this._addControlChangeListeners();
        this._synchronizeUI();
    }

    /**
     * Synchronize UI controls with current pattern and renderer values.
     */
    private _synchronizeUI(): void {
        const patternOptions = this._patternProxy!.getPatternOptions();
        const rendererOptions = this._patternProxy!.getRendererOptions();
        const currentPatternId = this._patternProxy!.getCurrentPatternId();

        Object.entries({
            ...patternOptions,
            ...rendererOptions,
        }).forEach(([key, value]) => {
            this._controlsGenerator!.setControlValue(key, value);
        });

        this._controlsGenerator!.setControlValue('pattern', currentPatternId);
    }
}

/**
 * Convenience function to create and initialize pattern controls.
 */
export function createPatternControls(container: HTMLFormElement, renderer: ASCIIRenderer): PatternControlsManager {
    return new PatternControlsManager(container, renderer);
}
