# ASCIIGround – AI coding agent guide

Use this playbook to be productive immediately in this repo. Keep edits small, run tests, and follow the patterns described here.

## Architecture overview
- Public entrypoint: `src/index.ts` exports ASCIIGround (facade), renderers, patterns, and utils.
- Rendering layers:
  - `ASCIIGround` orchestrates an `ASCIIRenderer` instance and exposes a chainable API: `.init() -> .startAnimation()/.stopAnimation() -> .setPattern()/.setOptions() -> .destroy()`.
  - `ASCIIRenderer` manages state, animation loop, resize handling, and delegates drawing to a `Renderer` implementation.
  - `rendering/renderer.ts` defines `Renderer` plus `Canvas2DRenderer` (implemented) and `WebGLRenderer` (stubbed; logs fallback warnings), and `createRenderer('2D'|'WebGL')`.
- Pattern system:
  - Base `Pattern<TOptions>` in `src/patterns/pattern.ts` with `initialize(region)`, `update(ctx)`, `generate(ctx): CharacterData[]`, `setOptions()`, and dirty flag.
  - Built-ins: `PerlinNoisePattern`, `RainPattern`, `StaticNoisePattern`, `DummyPattern` under `src/patterns/*-pattern.ts`.
  - Data contract: `CharacterData` (x,y,char,color?,opacity?,scale?,rotation?), `RenderRegion` (rows/cols, spacing, canvas size), `PatternContext` (time, delta, mouse, region, speed).
- Demo/docs pipeline:
  - Vite multi-mode config in `vite.config.ts`:
    - `mode lib` builds library (ES + UMD) with d.ts via `vite-plugin-dts`.
    - `mode demo` builds demo site to `docs/demo` using custom Eta HTML plugin `src/plugins/eta-plugin.ts` and template `src/demo/index.eta`.
    - Default dev server serves the demo with hot reload and template rendering middleware.

## Workflows (commands)
- Install: `npm i` (Node >= 18).
- Dev demo (HMR): `npm run dev` (serves `src/demo` with Eta template middleware).
- Build library: `npm run build` (tsc then `vite build --mode lib`).
- Build demo: `npm run build:demo` (outputs to `docs/demo`).
- Docs: `npm run build:docs` (TypeDoc -> `docs/api`).
- Tests: 
  - Watch: `npm run test:watch`
  - Single run: `npm run test:run`
  - Coverage: `npm run test:coverage` (V8; thresholds 80%).
- Lint/Format: `npm run lint` / `npm run lint:fix` (ESLint 9, flat config).
- Clean: `npm run clean` (removes dist/docs/coverage).

## Testing conventions
- Vitest + jsdom; global canvas mocks in `src/__tests__/test-setup.ts`.
- Prefer integration-style tests through `ASCIIGround`/`ASCIIRenderer` public APIs; don’t reach into private state.
- For new patterns, add tests under `src/__tests__/patterns/*.test.ts` mirroring existing ones. Use deterministic seeds via `createSeededRandom` where relevant.
- CI expects coverage >= 80% (see `vitest.config.ts`).

## Rendering and performance notes
- `ASCIIRenderer` avoids redundant draws using a character-list hash and pattern/renderer dirty flags; maintain this by:
  - Setting `pattern.isDirty = true` when option changes affect visual output, or override `setOptions` to compute it as done in built-ins.
  - When adding renderer options, update `_hasOptionsChanged`, `_calculateSpacing`, and `_calculateRegion` as needed.
- Resize behavior: canvas sizes to `options.resizeTo` (Window or HTMLElement). `ResizeObserver` is used for HTMLElements; remember to clean up in `destroy()`.
- Mouse interaction: gated by `enableMouseInteraction`; renderer updates `mouseInfo` and resets `clicked` each frame.

## Pattern authoring checklist
- Extend `Pattern<TOptions>`; set static `ID`.
- Implement `update(ctx)` and `generate(ctx)`; return a flat array of `CharacterData` in pixel coordinates using `region.charSpacingX/Y`.
- Call `initialize(region)` to cache region-dependent data and precalculated values.
- Implement `setOptions()` to preserve expensive state (see `PerlinNoisePattern.setOptions` for seed/permutation reuse) and set `isDirty` when visuals change.
- Keep characters within `region.start/endRow/Column`; renderer clips if needed.

## Demo integration
- Template: `src/demo/index.eta`; plugin injects `styles`/`scripts` based on `vite.config.ts`.
- Dev server renders Eta in middleware; changing the template triggers a full reload.
- Ship demo assets to `docs/demo` via `npm run build:demo`; public site expects `index.html` emitted by the Eta plugin.

## Publishing and bundles
- Outputs: `dist/asciiground.es.js` and `dist/asciiground.umd.js`; types at `dist/index.d.ts`.
- Size gate via `bundlesize` (30 kB for each build). Keep external deps minimal; the library is currently self-contained.

## Common pitfalls (and fixes)
- WebGL renderer is a stub: use `rendererType: '2D'` unless you implement the WebGL pipeline.
- Font metrics: spacing uses measured max glyph width and height; unusual fonts/spacings may need explicit `charSpacingX/Y`.
- Accessing `ASCIIGround` before `.init()` throws. Chain correctly in docs and tests.

## Key files map
- Entry: `src/index.ts`
- Renderer core: `src/rendering/ascii-renderer.ts`, `src/rendering/renderer.ts`
- Patterns: `src/patterns/*.ts` (perlin, rain, static)
- Demo: `src/demo/*`, `src/plugins/eta-plugin.ts`, `src/demo/index.eta`
- Tests: `src/__tests__/**/*`

If anything here seems off or incomplete (e.g., new scripts, patterns, or renderer backends), tell me what changed and I’ll update this guide promptly.

## Development Guidelines

### Philosophy
- Incremental progress over big bangs: small changes that compile and pass tests.
- Learn from existing code: study patterns and plan before implementing.
- Pragmatic over dogmatic: adapt to project reality.
- Clear intent over clever code: be boring and obvious.

Simplicity means:
- One responsibility per function/class; avoid premature abstractions.
- Prefer straightforward solutions; if it needs long explanation, simplify it.

### Process
Planning & staging: break complex work into 3–5 stages in `IMPLEMENTATION_PLAN.md` with Goal, Success Criteria, Tests, Status. Update as you go; remove when done.

Implementation flow (no TDD requirement):
1) Understand: review similar code in `src/patterns`, `rendering`, and tests.
2) Implement: minimal change that fits existing patterns and builds.
3) Add/Update tests: cover new behavior using Vitest/jsdom setup.
4) Refactor: keep code clear; maintain public APIs.

When stuck (after 3 attempts), stop and document: what failed, errors, hypotheses; research 2–3 alternatives; reconsider abstraction/scope; try a simpler or different angle.

### Technical standards
Architecture principles: dependency injection; interfaces over singletons; explicit data flow and deps.

Code quality: new changes must pass existing tests, include tests for new functionality, and follow lint/format rules.

Error handling: fail fast with descriptive messages, include context, handle at appropriate level; don’t swallow exceptions.

Decision framework: prefer options that optimize testability, readability, consistency with project patterns, simplicity, and reversibility.

Project integration: learn by finding 3 similar features/components, mirror conventions and utilities, follow existing test patterns. Use the project’s build/test/lint toolchain; don’t introduce new tools without strong justification.

### Quality gates
Definition of Done: tests written and passing; code matches conventions; no lint/format warnings; clear commit messages; implementation matches plan; no TODOs without issue numbers.

Test guidelines: test behavior (public APIs), keep names clear, use existing helpers (`src/__tests__/test-setup.ts`), and ensure determinism (e.g., `createSeededRandom`).
