import { StaticNoisePattern } from '../../../patterns/static-noise-pattern';
import type { PatternControlConfig } from './controls-registry';

export const controls: PatternControlConfig = {
    label: 'Static noise',
    pattern: StaticNoisePattern,
    controls: [
        {
            id: 'characters',
            label: 'Characters',
            type: 'text',
            outType: 'array',
            value: '█▓▒░',
            category: 'pattern',
            description: 'Characters used for rendering.',
        }
    ],
};
