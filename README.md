# ASCIIGround

[![CI/CD Pipeline](https://github.com/Eoic/asciiground/actions/workflows/ci-cd.yml/badge.svg?branch=master)](https://github.com/Eoic/asciiground/actions)
[![codecov](https://codecov.io/gh/Eoic/asciiground/graph/badge.svg?token=4M6ADHLZ4F)](https://codecov.io/gh/Eoic/asciiground)
[![npm version](https://img.shields.io/npm/v/asciiground.svg?style=flat)](https://www.npmjs.com/package/asciiground)
[![unpkg](https://img.shields.io/npm/v/asciiground?label=unpkg&color=blue)](https://unpkg.com/asciiground@latest/dist/)
[![](https://data.jsdelivr.com/v1/package/npm/asciiground/badge)](https://www.jsdelivr.com/package/npm/asciiground)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library for creating animated ASCII canvas backgrounds.

## Features

- Multiple animation patterns: **Perlin noise**, **rain**, **static noise** with extensible pattern system.
- Configuration options for font, animation speed, character sets, noise parameters, and much more.
- Responsive and resizable canvas rendering.
- Support for both 2D Canvas and WebGL rendering.
- Comprehensive API documentation.
- Mouse interaction support.
- Supports both ESM and UMD/CDN usage.

## Installation

### NPM

```bash
npm install asciiground
```

### CDN

```html
<script src="https://unpkg.com/asciiground@latest/dist/asciiground.umd.js"></script>
```

## Quick start

### Basic usage

```typescript
import { ASCIIGround, PerlinNoisePattern } from 'asciiground';

// Acquire canvas element.
const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;

// Create pattern instance.
const pattern = new PerlinNoisePattern({ 
  characters: [' ', '.', ':', ';', '+', '*', '#'] 
});

// Create and initialize renderer.
// Notice that method chaining can be used for convenience.
const asciiGround = new ASCIIGround()
  .init(canvas, pattern, { fontSize: 12, color: '#667eea' })
  .startAnimation();
```

### Switching patterns

```typescript
import { ASCIIGround, RainPattern, PerlinNoisePattern } from 'asciiground';

// Acquire canvas element.
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Create rain pattern instance.
const rainPattern = new RainPattern({ 
  characters: ['|', '!', '1', ':'],
  rainDensity: 0.8,
  minDropLength: 8,
  maxDropLength: 25,
});

// Create Perlin noise pattern instance.
const perlinNoisePattern = new PerlinNoisePattern({
  octaves: 4,
  frequency: 0.01,
  persistence: 0.5,
  lacunarity: 2.0,
  characters: [' ', '.', ':', ';', '+', '*', '#'],
});

// Initialize ASCIIGround with rain pattern and custom renderer options.
// You don't need to start animation immediately, it can be controlled later.
const asciiGround = new ASCIIGround()
  .init(canvas, rainPattern, { fontSize: 14, color: '#00ff00' });

// Switch to a new Perlin noise pattern.
asciiGround
  .setPattern(perlinNoisePattern)
  .startAnimation();
```

### CDN usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>ASCIIGround demo</title>
</head>
<body>
    <canvas id="ascii-canvas" width="800" height="600"></canvas>
    <script src="https://unpkg.com/asciiground@latest/dist/asciiground.umd.js"></script>
    <script>
        const { ASCIIGround, PerlinNoisePattern } = window.ASCIIGround;

        const canvas = document.getElementById('ascii-canvas');

        const pattern = new PerlinNoisePattern({ 
          octaves: 4,
          frequency: 0.05,
          characters: [' ', '.', ':', ';', '+', '*', '#'],
        });

        const asciiGround = new ASCIIGround()
          .init(canvas, pattern, { fontSize: 14 })
          .startAnimation();
    </script>
</body>
</html>
```

## Available patterns

### Perlin noise
Creates smooth, organic-looking patterns like clouds, terrain or flowing effects.

```typescript
import { PerlinNoisePattern } from 'asciiground';

const pattern = new PerlinNoisePattern({
  seed: 0,
  octaves: 4,
  frequency: 0.05,
  lacunarity: 2.0,
  persistence: 0.5,
  characters: [' ', '.', ':', ';', '+', '*', '#', '@'],
});
```

### Rain
Creates a downward flowing effect reminiscent of digital rain.

```typescript
import { RainPattern } from 'asciiground';

const pattern = new RainPattern({
  rainDensity: 0.8,
  minSpeed: 0.5,
  maxSpeed: 1.5,
  minDropLength: 8,
  maxDropLength: 25,
  mutationRate: 0.04,
  fadeOpacity: 0.2,
  headColor: '#FFFFFF',
  characters: ['|', '!', '1', ':'],
});
```

### Static noise
Random noise effect for TV static or glitch aesthetics.

```typescript
import { StaticNoisePattern } from 'asciiground';

const pattern = new StaticNoisePattern({
  seed: 42,
  characters: [' ', '.', '*', '#'],
});
```

## Examples

### Matrix-style rain

```typescript
import { ASCIIGround, RainPattern } from 'asciiground';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const pattern = new RainPattern({
  rainDensity: 0.9,
  minSpeed: 1.0,
  maxSpeed: 2.5,
  minDropLength: 3,
  maxDropLength: 15,
  fadeOpacity: 0.1,
  headColor: '#FFFFFF',
  characters: ['0', '1', '|', '!', ':', '.', ' '],
});

const asciiGround = new ASCIIGround()
  .init(canvas, pattern, {
    fontSize: 14,
    color: '#00ff00',
    backgroundColor: '#000000'
  })
  .startAnimation();
```

### Animated perlin noise

```typescript
import { ASCIIGround, PerlinNoisePattern } from 'asciiground';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const pattern = new PerlinNoisePattern({
  octaves: 3,
  frequency: 0.02,
  persistence: 0.4,
  characters: [' ', '░', '▒', '▓', '█'],
});

const asciiGround = new ASCIIGround();

asciiGround
  .init(canvas, pattern, {
    fontSize: 12,
    color: '#667eea',
    animationSpeed: 0.5,
    backgroundColor: '#1a1a2e',
  })
  .startAnimation();
```

## API reference

Complete API documentation is available at [https://eoic.github.io/ASCIIGround/api/](https://eoic.github.io/ASCIIGround/api/).

The documentation includes:
- Complete class and interface references.
- Pattern creation guides.
- Configuration options.
- Interactive examples.
- Source code links.

### Core classes

- **ASCIIGround** - main entry point for static and animated backgrounds, suitable for most use cases.
- **ASCIIRenderer** - renderer for full control over the rendering process.
- **Pattern classes** - PerlinNoisePattern, RainPattern, StaticNoisePattern.
- **Custom patterns** - extend the Pattern base class to create your own unique effects.

## Development

### Setup

```bash
git clone https://github.com/Eoic/asciiground.git
cd asciiground
npm install
```

### Development server

```bash
npm run dev
```

The development server will:
- Generate the demo page from the template.
- Serve the demo with live library hot-reloading.
- Open the demo page in your browser.
- Watches for changes and reloads the page automagically.

### Building the library

```bash
npm run build           # Build library (same as build:lib).
npm run build:demo      # Build demo page.
```

### Documentation

```bash
npm run build:docs      # Generate API documentation.
```

The generated documentation will be available in `docs/api/`. You can view it by opening `docs/api/index.html` in your browser or by serving the docs directory with a local server.

### Type checking

```bash
npm run typecheck
```

### Testing

```bash
npm run test:watch     # Run tests in watch mode.
npm run test:run       # Run tests once.
npm run test:coverage  # Generate coverage report.
```

### Publishing

This project uses automated publishing via GitHub Actions. See [PUBLISHING.md](./PUBLISHING.md) for detailed setup instructions.

```bash
npm run publish:patch  # 1.0.0 → 1.0.1.
npm run publish:minor  # 1.0.0 → 1.1.0.
npm run publish:major  # 1.0.0 → 2.0.0.
```

### Validate setup

Before first publish, run the setup validation:

```bash
./scripts/test-setup.sh
```

This checks all required files, configurations, and build processes.

### Development workflow
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and add tests.
4. Run the test suite: `npm run test:run`.
5. Run type checking: `npm run typecheck`.
6. Run linting: `npm run lint`.
7. Commit your changes: `npm run commit` and follow the prompts.
8. Push to the branch: `git push origin feature/your-feature`.
9. Create a pull request.

### Repository setup (for maintainers)

Before pushing to production, ensure these secrets are configured in GitHub:

1. **NPM_TOKEN** - required for automated NPM publishing:
   - Go to [npmjs.com](https://npmjs.com) → Account → Access Tokens.
   - Create "Automation" token with "Publish" permissions.
   - Add to GitHub from Settings → Secrets and variables → Actions.

2. **GitHub Pages** - required for CDN deployment:
   - Go to repository Settings → Pages.
   - Set "Source" to "GitHub Actions".

3. **Codecov** - for coverage reporting:
   - Connect repository at [codecov.io](https://codecov.io).
   - Add `CODECOV_TOKEN` to repository secrets.

See [PUBLISHING.md](./PUBLISHING.md) for complete setup instructions.

### Pre-push checklist

Before pushing to the remote repository:

- [ ] All tests pass: `npm run test:run`.
- [ ] Code builds successfully: `npm run build`.
- [ ] Type checking passes: `npm run typecheck`.
- [ ] Linting passes: `npm run lint`.
- [ ] Setup validation passes: `./scripts/test-setup.sh`.
- [ ] Documentation is up to date.
- [ ] `NPM_TOKEN` secret is configured in GitHub (for publishing).
- [ ] `CODECOV_TOKEN` secret is configured in GitHub (for test coverage).
- [ ] GitHub Pages is enabled.
