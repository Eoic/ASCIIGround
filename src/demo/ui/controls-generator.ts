import { ControlsRegistry, type ControlSpec } from './controls/controls-registry';
import type { ControlValue } from './pattern-proxy';

/**
 * Dynamic UI generator that creates controls based on pattern specifications.
 */
export class ControlsGenerator {
    private _container: HTMLFormElement;
    private _listeners: Map<string, Array<(value: ControlValue) => void>> = new Map();

    constructor(container: HTMLFormElement) {
        this._container = container;
        this._addContainerListeners();
    }

    /**
     * Generate controls for a specific pattern type.
     */
    public generatePatternControls(patternType: string): void {
        this._clearControls();
        const patternConfig = ControlsRegistry.getPatternControls(patternType);
        const rendererConfig = ControlsRegistry.getRendererControls();
        this._createPatternSelector(patternType);
        this._createControlsSection(rendererConfig.controls);
        this._createControlsSection(patternConfig.controls);
    }

    /**
     * Add listener for control changes.
     */
    public onControlChange(controlId: string, callback: (value: ControlValue) => void): void {
        if (!this._listeners.has(controlId))
            this._listeners.set(controlId, []);

        this._listeners.get(controlId)!.push(callback);
    }

    /**
     * Remove listener for control changes.
     */
    public offControlChange(controlId: string): void {
        if (this._listeners.has(controlId)) {
            this._listeners.delete(controlId);
            return;
        }

        console.warn(`No listeners found for control: ${controlId}`);
    }

    /**
     * Remove all listeners for a control.
     */
    public removeControlListeners(controlId: string): void {
        this._listeners.delete(controlId);
    }

    /**
     * Get current value of a control.
     */
    public getControlValue(controlId: string): ControlValue | null {
        const element = this._container.querySelector(`[data-control-id="${controlId}"]:not(label)`) as HTMLElement;

        if (!element)
            return null;

        return this._parseControlValue(element, controlId);
    }

    /**
     * Set value of a control.
     */
    public setControlValue(controlId: string, value: ControlValue): void {
        const element = this._container.querySelector(`[data-control-id="${controlId}"]:not(label)`) as HTMLInputElement;

        if (!element)
            return;

        switch (element.type) {
            case 'checkbox':
                element.checked = Boolean(value);
                break;
            case 'number':
            case 'range': {
                element.value = String(value);
                const valueDisplay = element.parentElement?.querySelector('.range-value');

                if (valueDisplay)
                    valueDisplay.textContent = String(value);

                break;
            }
            default:
                element.value = (Array.isArray(value)) ? value.join('') : String(value);
        }
    }

    /**
     * Get all current control values.
     */
    public getAllControlValues(): Record<string, ControlValue | null> {
        const values: Record<string, ControlValue | null> = {};
        const controls = this._container.querySelectorAll('[data-control-id]');

        controls.forEach((control) => {
            const controlId = control.getAttribute('data-control-id');

            if (controlId)
                values[controlId] = this.getControlValue(controlId);
        });

        return values;
    }

    /**
     * Add listeners to the container for control changes.
     */
    private _addContainerListeners(): void {
        this._container.addEventListener('input', this._handleControlInput);
    }

    /**
     * Emit change event to all listeners.
     */
    public _emitChange(controlId: string, value: ControlValue): void {
        const listeners = this._listeners.get(controlId) || [];
        listeners.forEach((callback) => callback(value));
    }

    public destroy(): void {
        this._container.removeEventListener('input', this._handleControlInput);
        this._listeners.clear();
        this._clearControls();
    }

    /**
     * Create a section with grouped controls.
     */
    private _createControlsSection(controls: ControlSpec[]): void {
        controls.forEach(control => {
            const controlElement = this._createControl(control);
            this._container.appendChild(controlElement);
        });
    }

    /**
     * Create pattern selector dropdown.
     */
    private _createPatternSelector(currentPattern: string): void {
        const patterns = ControlsRegistry.getAvailablePatterns();

        const control: ControlSpec = {
            id: 'pattern',
            label: 'Pattern',
            type: 'select',
            outType: 'string',
            value: currentPattern,
            options: patterns,
            category: 'renderer',
            description: 'Select a pattern.',
        };

        const controlElement = this._createControl(control);
        controlElement.classList.add('pattern-selector');
        this._container.appendChild(controlElement);
    }

    /**
     * Create a single control element based on its specification.
     */
    private _createControl(spec: ControlSpec): HTMLElement {
        let input: HTMLElement;
        let inputContainer: HTMLDivElement | null = null;
        const label = document.createElement('label');
        label.className = `control-item control-${spec.type}`;
        label.setAttribute('data-control-id', spec.id);

        const labelText = document.createElement('span');
        labelText.className = 'control-label';
        labelText.textContent = spec.label;

        if (spec.description) 
            labelText.title = spec.description;

        label.appendChild(labelText);

        switch (spec.type) {
            case 'number':
            case 'range':
                [inputContainer, input] = this._createNumberInput(spec);
                break;
            case 'text':
                input = this._createTextInput(spec);
                break;
            case 'textarea':
                input = this._createTextAreaInput(spec);
                break;
            case 'color':
                input = this._createColorInput(spec);
                break;
            case 'select':
                input = this._createSelectInput(spec);
                break;
            case 'checkbox':
                [inputContainer, input] = this._createCheckboxInput(spec);
                break;
            case 'color-map':
                input = this._createColorMapInput(spec);
                break;
            default:
                input = this._createTextInput(spec);
        }

        input.setAttribute('data-control-id', spec.id);
        input.setAttribute('id', `${spec.category}-${spec.id}`);
        input.setAttribute('name', spec.id);

        if (inputContainer) {
            inputContainer.setAttribute('data-control-id', spec.id);
            label.appendChild(inputContainer);
        } else label.appendChild(input);

        let isVisible = true;

        for (const condition of spec.visibleOn || []) {
            const key = Object.keys(condition)[0];
            const value = condition[key];
            const controlSpec = ControlsRegistry.getControlSpec(key);

            if (!controlSpec) {
                console.warn(`Control spec for "${key}" not found.`);
                continue;
            }

            isVisible &&= (controlSpec.value === value);
        }

        label.classList.toggle('hidden', !isVisible);
        return label;
    }

    /**
     * Create number/range input.
     */
    private _createNumberInput(spec: ControlSpec): [HTMLInputElement | HTMLDivElement, HTMLInputElement] {
        const input = document.createElement('input');
        input.type = spec.type === 'range' ? 'range' : 'number';
        input.value = String(spec.value);

        if (spec.min !== undefined)
            input.min = String(spec.min);

        if (spec.max !== undefined)
            input.max = String(spec.max);

        if (spec.step !== undefined)
            input.step = String(spec.step);

        if (spec.type === 'range') {
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'range-value';
            valueDisplay.textContent = String(spec.value);
            input.addEventListener('input', () => valueDisplay.textContent = input.value);

            const container = document.createElement('div');
            container.className = 'range-container';
            container.appendChild(input);
            container.appendChild(valueDisplay);

            return [container, input];
        }

        return [input, input];
    }

    /**
     * Create text input.
     */
    private _createTextInput(spec: ControlSpec): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = String(spec.value);
        return input;
    }

    /**
     * Create textarea input.
     */
    private _createTextAreaInput(spec: ControlSpec): HTMLTextAreaElement {
        const input = document.createElement('textarea');
        input.value = String(spec.value);
        input.rows = 2;
        return input;
    }

    /**
     * Create color input.
     */
    private _createColorInput(spec: ControlSpec): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = String(spec.value);
        return input;
    }

    /**
     * Create select input.
     */
    private _createSelectInput(spec: ControlSpec): HTMLSelectElement {
        const select = document.createElement('select');
        
        if (spec.options) {
            spec.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = String(option.value);
                optionElement.textContent = option.label;
                optionElement.selected = option.value === spec.value;
                select.appendChild(optionElement);
            });
        }

        return select;
    }

    /**
     * Create checkbox input.
     */
    private _createCheckboxInput(spec: ControlSpec): [HTMLDivElement, HTMLInputElement] {
        const container = document.createElement('div');
        container.className = 'toggle-switch';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = Boolean(spec.value);

        const slider = document.createElement('span');
        slider.className = 'toggle-slider';

        container.appendChild(input);
        container.appendChild(slider);

        return [container, input];
    }

    /**
     * Create color map input allowing character-color pairs.
     */
    private _createColorMapInput(spec: ControlSpec): HTMLDivElement {
        const container = document.createElement('div');
        container.className = 'color-map';

        const list = document.createElement('div');
        list.className = 'color-map-list';
        container.appendChild(list);

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-secondary btn-sm color-map-add';
        addButton.textContent = 'Add mapping';
        container.appendChild(addButton);

        const addRow = (char = '', color = '#ffffff') => {
            const row = document.createElement('div');
            row.className = 'color-map-row';

            const charInput = document.createElement('input');
            charInput.type = 'text';
            charInput.maxLength = 1;
            charInput.className = 'color-map-char';
            charInput.setAttribute('data-control-id', spec.id);
            charInput.value = char;

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'color-map-color';
            colorInput.setAttribute('data-control-id', spec.id);
            colorInput.value = color;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-outline btn-icon color-map-remove';
            removeBtn.textContent = '×';

            removeBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                row.remove();
                this._emitChange(spec.id, this._getColorMapValue(container));
            });

            row.appendChild(charInput);
            row.appendChild(colorInput);
            row.appendChild(removeBtn);
            list.appendChild(row);
        };

        const initial = spec.value as Record<string, string>;
        Object.entries(initial).forEach(([char, color]) => addRow(char, color));

        addButton.addEventListener('click', (event) => {
            console.log(event);
            addRow();
            this._emitChange(spec.id, this._getColorMapValue(container));
        });

        return container;
    }

    private _getColorMapValue(container: HTMLElement): Record<string, string> {
        const map: Record<string, string> = {};
        const rows = container.querySelectorAll('.color-map-row');

        rows.forEach(row => {
            const charInput = row.querySelector('.color-map-char') as HTMLInputElement | null;
            const colorInput = row.querySelector('.color-map-color') as HTMLInputElement | null;

            if (charInput && charInput.value)
                map[charInput.value] = colorInput?.value || '';
        });

        return map;
    }

    private _parseControlValue(target: HTMLElement, controlId: string): ControlValue {
        const controlSpec = ControlsRegistry.getControlSpec(controlId);

        if (!controlSpec)
            return (target as HTMLInputElement).value as ControlValue;

        switch (controlSpec.outType) {
            case 'boolean':
                if ((target as HTMLInputElement).type === 'checkbox')
                    return (target as HTMLInputElement).checked;

                return Boolean((target as HTMLInputElement).value);
            case 'number':
                return parseFloat((target as HTMLInputElement).value);
            case 'array':
                return Array.from((target as HTMLInputElement).value);
            case 'record': {
                const container = target.closest(`label[data-control-id="${controlId}"]`) as HTMLElement;
                return this._getColorMapValue(container);
            }
            case 'string':
            default:
                return (target as HTMLInputElement).value;
        }
    }

    /**
     * Handle control value changes.
     */
    private _handleControlInput = (event: Event): void => {
        const target = event.target as HTMLInputElement;
        const controlId = target.getAttribute('data-control-id');

        if (!controlId) {
            console.warn(`Control ${controlId} not found for input:`, target);
            return;
        }

        const value = this._parseControlValue(target, controlId);
        const controls = ControlsRegistry.getAllControlsSpecs();

        for (const control of controls) {
            if (!control.visibleOn)
                continue;

            const conditions = control.visibleOn.filter((condition) => condition[controlId] !== undefined) ?? [];

            if (conditions.length === 0)
                continue;

            const isVisible = conditions.some((condition) => condition[controlId] === value);

            this._container
                .querySelector(`label[data-control-id="${control.id}"]`)
                ?.classList.toggle('hidden', !isVisible);
        }

        this._emitChange(controlId, value);
    };

    /**
     * Clear all controls from the container.
     */
    private _clearControls(): void {
        this._container.innerHTML = '';
    }
}
