# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ASCIIGround is a TypeScript library for creating animated ASCII canvas backgrounds. It provides pattern generators (Perlin noise, rain, static noise) with a chainable API for initialization and animation control.

## Commands

```bash
# Development
npm run dev              # Start dev server with HMR (serves demo)
npm run build            # Build library (tsc + vite build)
npm run build:demo       # Build demo site to docs/demo
npm run build:docs       # Generate TypeDoc API documentation

# Testing
npm run test:run         # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report (80% threshold)

# Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # TypeScript type checking

# Cleanup
npm run clean            # Remove dist, coverage, docs/api, docs/demo
```

## Architecture

### Core components

- **ASCIIGround** (`src/index.ts`): Facade class with chainable API: `.init()` -> `.startAnimation()` / `.stopAnimation()` -> `.setPattern()` / `.setOptions()` -> `.destroy()`
- **ASCIIRenderer** (`src/rendering/ascii-renderer.ts`): Manages animation loop, state, resize handling; delegates drawing to Renderer implementations
- **Renderer** (`src/rendering/renderer.ts`): Interface with `Canvas2DRenderer` (implemented) and `WebGLRenderer` (stubbed). Use `createRenderer('2D'|'WebGL')` factory

### Pattern system

- **Base class**: `Pattern<TOptions>` in `src/patterns/pattern.ts`
  - `initialize(region)`: Cache region-dependent data
  - `update(context)`: Update pattern state per frame
  - `generate(context): CharacterData[]`: Generate character data in pixel coordinates
  - `setOptions()`: Update options with dirty flag management
- **Built-in patterns**: `PerlinNoisePattern`, `RainPattern`, `StaticNoisePattern`, `DummyPattern`
- **Data contracts**: `CharacterData` (x, y, char, color, opacity, scale, rotation), `RenderRegion` (rows/cols, spacing, canvas size), `PatternContext` (time, delta, mouse, region, speed)

### Demo/docs pipeline

Vite multi-mode config (`vite.config.ts`):

- `mode lib`: Builds library (ES + UMD) with d.ts via `vite-plugin-dts`
- `mode demo`: Builds demo to `docs/demo` using Eta template plugin (`src/plugins/eta-plugin.ts`)
- Default dev: Serves demo with HMR and template middleware

## Code style

Detailed guidelines in `.github/AI_CODE_STYLE_GUIDE.md`. Key points:

### Formatting

- 4-space indentation (not tabs)
- Single quotes, always semicolons
- 120 character line limit
- Trailing commas: arrays/imports/functions (never), multi-line objects (always)
- No emojis anywhere
- Sentence case for titles

### Naming

- Files: `kebab-case.ts`
- Classes: `PascalCase` (suffix: `Pattern`, `Renderer`)
- Interfaces: `PascalCase` (suffix: `Options`)
- Variables/functions: `camelCase`
- Private members: `_underscorePrefix`
- Constants: `UPPER_SNAKE_CASE`

### TypeScript

- Use `interface` for object shapes, `type` for unions/intersections
- `import type` for type-only imports
- Explicit return types for public methods
- Generic types with descriptive names (`TOptions` not `T`)

### Documentation

- JSDoc for all public APIs with `@category` tags
- Avoid inline comments; write self-documenting code
- Only comment non-obvious algorithmic complexity or business logic

## Testing

- Framework: Vitest with jsdom environment
- Tests in `src/__tests__/` mirroring source structure
- Global canvas mocks in `src/__tests__/test-setup.ts`
- Use `createSeededRandom()` for deterministic tests
- Test public APIs; don't reach into private state
- Minimum 80% coverage required

## Pattern authoring

1. Extend `Pattern<TOptions>` with static `ID` property
2. Implement `update(ctx)` and `generate(ctx)` returning `CharacterData[]` in pixel coordinates
3. Use `region.charSpacingX/Y` for positioning
4. Override `setOptions()` to preserve expensive state and set `isDirty` when visuals change
5. Keep characters within `region.start/endRow/Column`

## Performance notes

- ASCIIRenderer uses character-list hash and dirty flags to avoid redundant draws
- Set `pattern.isDirty = true` when option changes affect visual output
- Resize uses `ResizeObserver` for HTMLElements; clean up in `destroy()`
- Mouse interaction gated by `enableMouseInteraction` option

## Commit messages

Follow Conventional Commits: `<type>[scope]: <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

## Pre-push checklist

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:run`
4. `npm run build`
