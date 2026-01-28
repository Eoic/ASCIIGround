# AI Code Style Guidelines for ASCIIGround

This document provides comprehensive code style guidelines for AI agents working on the ASCIIGround codebase. These guidelines are derived from the existing codebase patterns, ESLint configuration, and TypeScript conventions.

## Table of contents

1. [Code formatting](#code-formatting)
2. [TypeScript conventions](#typescript-conventions)
3. [Naming conventions](#naming-conventions)
4. [File organization](#file-organization)
5. [Import/export patterns](#importexport-patterns)
6. [Documentation standards](#documentation-standards)
7. [Testing standards](#testing-standards)
8. [Error handling](#error-handling)
9. [Class and interface design](#class-and-interface-design)
10. [Project-specific patterns](#project-specific-patterns)

---

## Code formatting

### Indentation
- **Use 4 spaces** for indentation (not tabs)
- Switch cases should be indented one level from the switch statement

```typescript
switch (value) {
    case 'a':
        doSomething();
        break;
    case 'b':
        doSomethingElse();
        break;
}
```

### Line length
- **Maximum line length: 120 characters**
- Break long lines logically at appropriate points

### Quotes
- **Use single quotes** for strings: `'string'`
- Use backticks for template literals: `` `template ${variable}` ``

### Semicolons
- **Always use semicolons** at the end of statements

### End of line
- **Always include a newline** at the end of files

### Braces
- Use `multi-or-nest` curly brace style:
  - Single-line statements can omit braces
  - Multi-line statements require braces

```typescript
// Acceptable - single line without braces
if (condition)
    doSomething();

// Required - multi-line with braces
if (condition) {
    doSomething();
    doSomethingElse();
}
```

### Comma dangling
- **Arrays**: Never use trailing commas
- **Objects**: Always use trailing commas for multi-line objects
- **Imports/Exports**: Never use trailing commas
- **Functions**: Never use trailing commas

```typescript
// Arrays - no trailing comma
const array = [1, 2, 3];

// Objects - trailing comma on multi-line
const object = {
    prop1: 'value1',
    prop2: 'value2',
};

// Single-line object - no trailing comma
const singleLine = { prop: 'value' };

// Imports - no trailing comma
import { Component, Helper } from './module';
```

### Comments
- **Avoid inline explanatory comments** - Write self-documenting code instead
- Use descriptive variable and function names that explain intent
- Only add comments for non-obvious algorithmic complexity or business logic
- Use JSDoc for public APIs and complex interfaces (see [Documentation standards](#documentation-standards))

```typescript
// Bad - inline comments explain obvious code
function calculateTotal(price: number, quantity: number): number {
    // We do multiplication here.
    const subtotal = price * quantity;
    
    // We apply tax here.
    const tax = subtotal * 0.1;
    
    // We add tax to subtotal.
    return subtotal + tax;
}

// Good - self-documenting code with clear names
function calculateTotal(price: number, quantity: number): number {
    const subtotal = price * quantity;
    const tax = subtotal * 0.1;
    return subtotal + tax;
}

// Good - complex logic with helpful comment
function calculateTotal(price: number, quantity: number): number {
    const subtotal = price * quantity;
    // Tax rate of 10% applies to all orders per regulation XYZ-2024.
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    return subtotal + tax;
}
```

### Emojis and visual markers
- **Never use emojis** in code, comments, documentation, or commit messages
- Do not use visual markers like ❌, ✅, 🚀, etc.
- Use plain text labels instead: "Bad:", "Good:", "Note:", "Warning:", etc.

### Documentation style
- **Use sentence case for all titles and headers** - Capitalize only the first word
- Example: "Naming conventions" not "Naming Conventions"
- Example: "Code formatting" not "Code Formatting"
- Applies to section headers, JSDoc titles, README sections, etc.

---

## TypeScript conventions

### Strict mode
- **Always use TypeScript strict mode** (`"strict": true`)
- Enable all strict type-checking options
- Set `noUnusedLocals` and `noUnusedParameters` to `true`

### Type declarations
- Prefer `interface` for object shapes and API contracts
- Use `type` for unions, intersections, and complex type manipulations
- Use `type` for aliasing existing interfaces

```typescript
// Interface for object shapes
export interface PatternOptions {
    characters: string[];
}

// Type for unions
export type RendererType = '2D' | 'WebGL';

// Type for aliasing
export type DummyPatternOptions = PatternOptions;
```

### Type imports
- Use `type` keyword for type-only imports

```typescript
import type { Pattern } from './patterns/pattern';
import type { ASCIIRendererOptions } from './rendering/ascii-renderer';
```

### Explicit return types
- Always specify return types for public methods
- Return types can be inferred for simple private methods

```typescript
// Public method - explicit return type
public init(canvas: HTMLCanvasElement, pattern: Pattern): ASCIIGround {
    // ...
    return this;
}

// Private method - can infer simple types
private _setupContext(): void {
    // ...
}
```

### Generic types
- Use generic constraints when needed
- Name generic types descriptively (e.g., `TOptions` instead of just `T`)

```typescript
export abstract class Pattern<TOptions extends PatternOptions> {
    // ...
}
```

---

## Naming conventions

### Files
- Use **kebab-case** for file names: `perlin-noise-pattern.ts`
- Test files: `*.test.ts`
- Type definition files: `*.d.ts`

### Classes
- Use **PascalCase** for class names: `ASCIIGround`, `PerlinNoisePattern`
- Suffix pattern classes with `Pattern`: `RainPattern`, `StaticNoisePattern`
- Suffix renderer classes with `Renderer`: `ASCIIRenderer`, `Canvas2DRenderer`

### Interfaces and types
- Use **PascalCase** for interface and type names
- Suffix options interfaces with `Options`: `PatternOptions`, `ASCIIRendererOptions`
- No `I` prefix for interfaces

```typescript
export interface PatternOptions {
    characters: string[];
}

export interface ASCIIRendererOptions {
    color: string;
    fontSize: number;
}
```

### Variables and Functions
- Use **camelCase** for variables and functions: `animationSpeed`, `createRenderer`

### Private members
- Prefix private class members with underscore: `_state`, `_renderer`, `_permutations`

```typescript
export class ASCIIRenderer {
    private _state = initState();
    private _handleResize: VoidFunction;
}
```

### Constants
- Use **UPPER_SNAKE_CASE** for module-level constants
- Use **camelCase** for constant function parameters

```typescript
const DEFAULT_OPTIONS: ASCIIRendererOptions = {
    color: '#3e3e80ff',
    fontSize: 32,
};
```

### Static members
- Use **UPPER_SNAKE_CASE** for static constants on classes

```typescript
export class PerlinNoisePattern extends Pattern<PerlinNoisePatternOptions> {
    public static readonly ID = 'perlin-noise';
}
```

### Getters and Setters
- Use camelCase without `get`/`set` prefix in the property name

```typescript
public get pattern(): Pattern {
    return this.renderer.pattern;
}

private get renderer(): ASCIIRenderer {
    if (!this._renderer) 
        throw new Error('Renderer is not initialized');

    return this._renderer;
}
```

### Unused parameters
- Prefix unused parameters with underscore: `_context`, `_options`

```typescript
public update(_context: PatternContext): PerlinNoisePattern {
    return this;
}
```

---

## File organization

### Directory structure
```
src/
├── index.ts              # Main entry point with exports
├── patterns/             # Pattern implementations
│   ├── pattern.ts        # Base pattern class
│   ├── perlin-noise-pattern.ts
│   ├── rain-pattern.ts
│   └── static-noise-pattern.ts
├── rendering/            # Rendering implementations
│   ├── ascii-renderer.ts
│   └── renderer.ts
├── utils/                # Utility functions
│   └── seeded-random.ts
├── plugins/              # Build plugins
└── __tests__/            # Test files
    ├── patterns/
    ├── rendering/
    └── utils/
```

### File content order
1. Imports (type imports first, then regular imports)
2. Type definitions and interfaces
3. Constants
4. Class implementation
5. Default export (if applicable)
6. Named exports

```typescript
// 1. Imports - type imports first
import type { Pattern } from './patterns/pattern';
import { ASCIIRenderer } from './rendering/ascii-renderer';

// 2. Type definitions
export interface Options {
    value: string;
}

// 3. Constants
const DEFAULT_VALUE = 'default';

// 4. Class implementation
export class MyClass {
    // ...
}

// 5. Default export
export default MyClass;
```

---

## Import/export patterns

### Import organization
1. Type-only imports first
2. External dependencies
3. Internal modules (relative imports)

```typescript
import type { Pattern, PatternContext } from './patterns/pattern';
import { describe, it, expect } from 'vitest';
import { createSeededRandom } from '../utils/seeded-random';
```

### Export patterns

#### Grouped Exports
Use grouped exports at the end of the main entry file with JSDoc categories:

```typescript
/**
 * @category Patterns
 */
export { 
    Pattern, 
    type PatternOptions, 
    type PatternContext, 
    type CharacterData, 
    type RenderRegion 
} from './patterns/pattern';

/**
 * @category Rendering
 */
export { 
    ASCIIRenderer, 
    type ASCIIRendererOptions 
} from './rendering/ascii-renderer';
```

#### Direct Exports
Export classes and interfaces directly from their definition files:

```typescript
export class ASCIIGround {
    // ...
}

export interface ASCIIRendererOptions {
    // ...
}
```

### No trailing commas in exports
```typescript
// Correct
export { 
    Pattern, 
    type PatternOptions 
} from './patterns/pattern';

// Incorrect
export { 
    Pattern, 
    type PatternOptions, // trailing comma not allowed
} from './patterns/pattern';
```

---

## Documentation standards

### JSDoc comments
- Use JSDoc comments for all public APIs
- Include `@category` tags for TypeDoc organization
- Provide examples for main classes and complex APIs

### File-level documentation
Start main files with a comprehensive header:

```typescript
/**
 * ASCIIGround - A TypeScript library for creating animated ASCII canvas backgrounds.
 * 
 * This library provides a comprehensive solution for creating stunning ASCII-based animations
 * that can be used as website backgrounds. It supports various pattern generators including
 * Perlin noise, rain effects, static noise, and custom patterns.
 * 
 * @author Karolis Strazdas
 * 
 * @example Basic usage
 * ```typescript
 * import { ASCIIGround, PerlinNoisePattern } from 'asciiground';
 * 
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement;
 * const pattern = new PerlinNoisePattern({ characters: ['.', ':', ';', '#'] });
 * 
 * const asciiGround = new ASCIIGround()
 *   .init(canvas, pattern, { fontSize: 12, color: '#667eea' })
 *   .startAnimation();
 * ```
 */
```

### Class documentation
```typescript
/**
 * The main ASCIIGround class that orchestrates pattern generation and rendering.
 * 
 * This class provides a high-level interface for creating animated ASCII backgrounds.
 * It manages the lifecycle of patterns and renderers, offering methods for initialization,
 * animation control, and configuration updates.
 * 
 * @category Main
 * 
 * @example Creating and controlling an ASCII animation
 * ```typescript
 * const asciiGround = new ASCIIGround();
 * 
 * // Initialize with canvas and pattern.
 * asciiGround.init(canvas, pattern, options);
 * 
 * // Control animation.
 * asciiGround.startAnimation();
 * asciiGround.stopAnimation();
 * ```
 */
export class ASCIIGround {
    // ...
}
```

### Interface documentation
```typescript
/**
 * Configuration options for the ASCII renderer.
 * @category Rendering
 */
export interface ASCIIRendererOptions {
    /** Text color for rendered characters */
    color: string;
    /** Mapping of characters to specific colors */
    colorMap: Record<string, string>;
    /** Whether animation is enabled */
    animated: boolean;
}
```

### Method documentation
```typescript
/**
 * Initialize the ASCIIGround instance with a canvas, a pattern and renderer options.
 * @param canvas - The HTML canvas element to render on.
 * @param pattern - The pattern to use for rendering.
 * @param options - Optional renderer options.
 * @returns The current ASCIIGround instance for method chaining.
 */
public init(
    canvas: HTMLCanvasElement,
    pattern: Pattern,
    options?: Partial<ASCIIRendererOptions>
): ASCIIGround {
    // ...
}
```

### Property documentation
Use inline comments for interface properties:

```typescript
export interface PerlinNoisePatternOptions extends PatternOptions {
    /** The base frequency of the Perlin noise. Higher values result in more rapid changes. */
    frequency: number;
    /** The number of noise layers to combine for fractal noise. More octaves add detail. */
    octaves: number;
    /** Controls the amplitude of each octave. Lower values reduce the influence of higher octaves. */
    persistence: number;
}
```

---

## Testing standards

### Test file organization
- Place test files in `src/__tests__/` directory
- Mirror source structure: `src/patterns/` → `src/__tests__/patterns/`
- Name test files: `*.test.ts`

### Test framework
- Use Vitest with jsdom environment
- Import test utilities: `import { describe, it, expect } from 'vitest';`

### Test structure
```typescript
import { describe, it, expect } from 'vitest';
import { PerlinNoisePattern } from '../../patterns/perlin-noise-pattern';

describe('PerlinNoisePattern', () => {
    it('should have correct ID', () => {
        expect(PerlinNoisePattern.ID).toBe('perlin-noise');
    });

    it('should create instance with default options', () => {
        const pattern = new PerlinNoisePattern();
        expect(pattern).toBeInstanceOf(PerlinNoisePattern);
        expect(pattern.options.frequency).toBe(0.01);
    });

    it('should generate deterministic noise with same seed', () => {
        const pattern1 = new PerlinNoisePattern({ seed: 12345 });
        const pattern2 = new PerlinNoisePattern({ seed: 12345 });
        const chars1 = pattern1.generate(mockContext);
        const chars2 = pattern2.generate(mockContext);
        expect(chars1).toEqual(chars2);
    });
});
```

### Mock objects
Create reusable mock objects for testing:

```typescript
const mockRegion: RenderRegion = {
    rows: 10,
    columns: 20,
    startRow: 0,
    endRow: 10,
    startColumn: 0,
    endColumn: 20,
    charWidth: 12,
    charHeight: 16,
    charSpacingX: 12,
    charSpacingY: 16,
    canvasWidth: 240,
    canvasHeight: 160,
};

const mockContext: PatternContext = {
    time: 1.0,
    deltaTime: 0.016,
    animationTime: 1.0,
    mouseX: 0,
    mouseY: 0,
    clicked: false,
    isAnimating: true,
    animationSpeed: 1.0,
    region: mockRegion,
};
```

### Deterministic testing
- Use seeded random number generators for reproducible tests
- Test with consistent mock data

```typescript
import { createSeededRandom } from '../utils/seeded-random';

it('should produce consistent results with seeded random', () => {
    const random = createSeededRandom(12345);
    const value = random();
    expect(value).toBeCloseTo(0.0073664188);
});
```

### Test coverage
- Maintain minimum 80% code coverage (configured in `vitest.config.ts`)
- Test public APIs thoroughly
- Test edge cases and error conditions

---

## Error handling

### Throwing errors
- Use descriptive error messages
- Include context about what went wrong
- Use `Error` constructor

```typescript
private get renderer(): ASCIIRenderer {
    if (!this._renderer) 
        throw new Error('Renderer is not initialized - call init() first.');
    
    return this._renderer;
}
```

### Null/undefined checks
- Use explicit null checks with early returns or throws
- Use optional chaining when appropriate

```typescript
const context = canvas.getContext('2d');

if (!context) 
    throw new Error('Could not get 2D context from canvas');

this._context = context;
```

### Type guards
```typescript
if (typeof value !== 'number')
    throw new Error(`Expected number, got ${typeof value}`);
```

---

## Class and interface design

### Method chaining
- Return `this` from methods that modify state to enable chaining
- Document that methods support chaining

```typescript
/**
 * Start the animation.
 * @returns The current ASCIIGround instance for method chaining.
 */
public startAnimation(): ASCIIGround {
    this.renderer.startAnimation();
    return this;
}
```

### Immutability
- Return frozen copies of internal state when exposing options

```typescript
public get options(): ASCIIRendererOptions {
    return Object.freeze(this.renderer.options);
}
```

### Abstract classes
- Use abstract classes for base implementations with shared logic
- Define abstract methods that subclasses must implement

```typescript
export abstract class Pattern<TOptions extends PatternOptions> {
    protected _options: TOptions;
    
    /**
     * Update pattern state based on context.
     * @param context - The current pattern context.
     */
    public abstract update(context: PatternContext): this;
    
    /**
     * Generate character data for rendering.
     * @param context - The current pattern context.
     */
    public abstract generate(context: PatternContext): CharacterData[];
}
```

### Interfaces for Contracts
- Define interfaces for public contracts and pluggable components

```typescript
/**
 * Common interface for all renderers.
 * @category Rendering
 */
export interface Renderer {
    initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void;
    clear(backgroundColor: string): void;
    render(characters: CharacterData[], region: RenderRegion): void;
    resize(width: number, height: number): void;
    destroy(): void;
}
```

### Factory functions
- Use factory functions for creating instances with complex initialization

```typescript
export const createRenderer = (rendererType: '2D' | 'WebGL'): Renderer => {
    switch (rendererType) {
        case '2D':
            return new Canvas2DRenderer();
        case 'WebGL':
            return new WebGLRenderer();
        default:
            throw new Error(`Unknown renderer type: ${rendererType}`);
    }
};
```

---

## Project-specific patterns

### Pattern classes
All pattern classes should:
1. Extend `Pattern<TOptions>` base class
2. Define a static `ID` property
3. Implement `update()` and `generate()` methods
4. Override `setOptions()` if custom logic is needed

```typescript
export class PerlinNoisePattern extends Pattern<PerlinNoisePatternOptions> {
    public static readonly ID = 'perlin-noise';
    
    public update(_context: PatternContext): PerlinNoisePattern {
        return this;
    }
    
    public generate({ animationTime, region }: PatternContext): CharacterData[] {
        // Implementation
    }
    
    public setOptions(newOptions: Partial<PerlinNoisePatternOptions>): void {
        const oldSeed = this._options.seed;
        super.setOptions(newOptions);
        
        if (newOptions.seed !== undefined && newOptions.seed !== oldSeed)
            this._permutations = this._generatePermutations(this._options.seed);
    }
}
```

### Options pattern
Use the options pattern with defaults:

```typescript
const DEFAULT_OPTIONS: MyOptions = {
    prop1: 'default1',
    prop2: 42,
};

constructor(options: Partial<MyOptions> = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
}
```

### Initialization pattern
Separate instantiation from initialization:

```typescript
// Create instance
const asciiGround = new ASCIIGround();

// Initialize with dependencies
asciiGround.init(canvas, pattern, options);
```

### State management
Use private state objects for complex internal state:

```typescript
const initState = () => ({
    canvas: null as HTMLCanvasElement | null,
    renderer: null as Renderer | null,
    pattern: null as Pattern | null,
    lastTime: 0,
    animationId: null as number | null,
});

export class ASCIIRenderer {
    private _state = initState();
}
```

### Resource cleanup
Always provide a `destroy()` method for cleanup:

```typescript
/**
 * Destroy the ASCIIGround instance, cleaning up resources.
 * This will stop the animation and nullify the renderer.
 */
public destroy(): void {
    this.renderer.destroy();
    this.renderer = null;
}
```

---

## Commit messages

Follow [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that do not affect code meaning (formatting)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Code change that improves performance
- `test` - Adding or correcting tests
- `chore` - Changes to build process or auxiliary tools
- `build` - Changes to build system or dependencies
- `ci` - Changes to CI configuration

### Examples
```bash
feat: add wave pattern animation
fix: resolve memory leak in canvas cleanup
docs: update installation instructions
refactor: simplify noise generation algorithm
test: add unit tests for pattern switching
```

---

## Build and development commands

### Common commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev server with HMR
npm run build            # Build library (TypeScript + Vite)
npm run build:demo       # Build demo site
npm run build:docs       # Generate TypeDoc documentation
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run typecheck        # Run TypeScript type checking
npm run clean            # Remove dist, coverage, docs
```

### Before committing
1. Run `npm run typecheck` to ensure TypeScript compiles
2. Run `npm run lint` to check for linting errors
3. Run `npm run test:run` to ensure all tests pass
4. Run `npm run build` to verify the build succeeds

---

## Summary checklist

When writing code for ASCIIGround, ensure:

- [ ] 4-space indentation, single quotes, semicolons
- [ ] Maximum 120 characters per line
- [ ] Trailing newline at end of files
- [ ] No emojis in code, comments, or documentation
- [ ] Use sentence case for titles (capitalize only first word)
- [ ] Avoid inline explanatory comments; use self-documenting code
- [ ] PascalCase for classes, interfaces, types
- [ ] camelCase for variables and functions
- [ ] kebab-case for file names
- [ ] Underscore prefix for private members
- [ ] Type imports use `import type` syntax
- [ ] Public methods have explicit return types
- [ ] JSDoc comments for all public APIs
- [ ] `@category` tags for TypeDoc organization
- [ ] Tests in `__tests__/` directory with `.test.ts` extension
- [ ] Method chaining returns `this` where appropriate
- [ ] Proper error messages with context
- [ ] Follow the options pattern with defaults
- [ ] Provide `destroy()` methods for cleanup
- [ ] Follow Conventional Commits for commit messages
