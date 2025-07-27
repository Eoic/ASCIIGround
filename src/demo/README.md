# Demo

The demo page showcases all available pattern generators implemented by the ASCIIGround library through an interactive interface with dynamically generated controls.

## Components

**Pattern controls manager** (`PatternControlsManager`) - main orchestrator that coordinates UI controls, pattern switching, and real-time updates between the interface and renderer.

**Pattern proxy** (`PatternProxy`) - manages pattern instances and acts as a bridge between UI controls and the renderer. Handles pattern switching and property updates with debounced updates for performance.

**Controls generator** (`ControlsGenerator`) - dynamically generates HTML form controls based on specifications from the controls registry. Creates inputs for pattern-specific options and renderer settings.

**Controls registry** (`ControlsRegistry`) - central registry containing control specifications for all patterns and renderer options. Maps pattern IDs to their corresponding control configurations and provides pattern constructor references.

## Control specifications

Each pattern has its own control specification file in the `controls/` directory that defines:
- Available configuration options.
- Control types (number, color, checkbox, select, etc.).
- Default values and constraints.
- UI labels and descriptions.

## Adding new patterns

To add a new pattern to the demo:

1. Create a control specification file in `controls/` directory
2. Register the pattern in `_PATTERN_CONTROLS` map in `controls-registry.ts`
3. The pattern will automatically appear in the pattern selection dropdown

The demo initializes with the perlin noise pattern by default and provides real-time visual feedback as users adjust control parameters.