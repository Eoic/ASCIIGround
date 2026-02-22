# ASCIIGround publishing & automation setup

This document explains how to set up automated publishing to NPM and CDN for the ASCIIGround library.

## Prerequisites

1. **GitHub repository** - ensure your code is hosted on GitHub.
2. **NPM account** - create an account at [npmjs.com](https://npmjs.com).
3. **Node.js** - version 20.x or higher.

## Initial setup

### 1. Repository configuration

1. **Enable GitHub pages**:
   - Go to repository Settings → Pages.
   - Set Source to "GitHub Actions".

2. **Add repository secrets**:
   Go to repository Settings → Secrets and variables → Actions and add:
   
   ```
   CODECOV_TOKEN: your_codecov_token
   ```

   To get your Codecov token:
   - Go to [codecov.io](https://codecov.io), login with GitHub and search for your repository.
   - Select the repository, and in the new page, choose "Using GitHub Actions" as a setup option.
   - Select "Global upload token" and click "Generate".
   - Copy the token and add it to your repository secrets as `CODECOV_TOKEN`.

### 2. Local development setup

```bash
# Clone and setup the project.
git clone https://github.com/Eoic/asciiground.git
cd asciiground

# Run setup script
./scripts/setup.sh

# Or manually:
npm install
npm run build
npm run test:run
```

## Publishing workflow

### Automated publishing (recommended)

1. **Use GitHub Actions workflow**:
   - Go to repository Actions tab.
   - Run "Release and publish" workflow.
   - Choose version type (patch/minor/major).
   - This will automatically:
     - Run tests.
     - Bump version.
     - Create GitHub release.
     - Publish to NPM.
     - Deploy to CDN.

2. **Manual publishing**:
   ```bash
   # Publish patch version (0.7.3 → 0.7.4)
   npm run publish:patch

   # Publish minor version (0.7.3 → 0.8.0)
   npm run publish:minor

   # Publish major version (0.7.3 → 1.0.0)
   npm run publish:major
   ```

### Release process flow

1. **Code changes** - push to `master` branch.
2. **CI pipeline** - automatically runs tests, linting, type checking.
3. **Version bump** - manual trigger or script execution.
4. **Release creation** - GitHub release with build artifacts.
5. **NPM publication** - automatic publishing to npm registry.
6. **CDN deployment** - files deployed to GitHub Pages CDN.
7. **Documentation update** - automatic docs site update.

## CDN access

After publishing, your library will be available via CDN:

### Latest version
```html
<script src="https://Eoic.github.io/asciiground/releases/latest/asciiground.umd.js"></script>
```

### Specific version
```html
<script src="https://Eoic.github.io/asciiground/releases/v1.0.0/asciiground.umd.js"></script>
```

### Alternative CDNs
```html
<!-- unpkg -->
<script src="https://unpkg.com/asciiground@latest/dist/asciiground.umd.js"></script>

<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/asciiground@latest/dist/asciiground.umd.js"></script>
```

## Development commands

```bash
# Development.
npm run dev             # Start development server.
npm run build           # Build library.
npm run test:watch      # Run tests in watch mode.
npm run test:coverage   # Generate coverage report.

# Quality assurance.
npm run typecheck       # TypeScript type checking.
npm run lint            # ESLint checking.
npm run lint:fix        # Auto-fix ESLint issues.

# Publishing (if not using GitHub Actions).
npm run publish:patch   # Publish patch version.
npm run publish:minor   # Publish minor version.
npm run publish:major   # Publish major version.

# Utilities.
npm run clean           # Clean dist and coverage.
npm run version:check   # Check outdated packages.
npm run setup           # Initial development setup.
```

## CI/CD pipeline details

### Triggers
- **Push to master** - runs tests and builds.
- **Pull request** - runs full test suite.
- **Manual workflow** - version bump, release creation and publishing.

### Build matrix
- Tests run on Node.js 18.x, 20.x, 22.x.
- Cross-platform testing (Ubuntu).
- Coverage reporting to Codecov.

### Security
- NPM token stored securely in GitHub Secrets.
- No sensitive data in the repository.
- Automated security scanning (dependabot).

## Monitoring and maintenance

### Package health
- **NPM** - https://www.npmjs.com/package/asciiground
- **Bundle size** - tracked in CI pipeline.
- **Test coverage** - reported to Codecov.
- **Type safety** - enforced via TypeScript.

### Documentation
- **API docs** - auto-generated from JSDoc comments.
- **Examples** - live demo deployed to GitHub Pages.

## Troubleshooting

### Common issues

1. **NPM publish fails**:
   - Check if `CODECOV_TOKEN` is set correctly.
   - Check if NPM publishing is configured correctly.
   - Verify that the package name is available.
   - Ensure version hasn't been published before.

2. **CDN deploy fails**:
   - Check if GitHub Pages is enabled.
   - Verify if repository permissions are correct.
   - Check if build artifacts exist.

3. **Tests fail**:
   - Run locally: `npm run test:run`.
   - Check test coverage: `npm run test:coverage`.
   - Review failing test output in CI.

### Debug commands
```bash
# Check build output.
npm run build && ls -la dist/

# Verify package contents.
npm pack && tar -tf asciiground-*.tgz

# Test installation locally.
npm install . && node -e "console.log(require('./package.json').version)"
```