import type { ControlValue } from './pattern-proxy';

export function formatControlValue(value: ControlValue): string {
    if (typeof value === 'object' && !Array.isArray(value))
        return JSON.stringify(value);

    return String(value);
}
