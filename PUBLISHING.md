# Publishing

## Release

1. On a working branch, run `npm version patch --no-git-tag-version` (or `minor` / `major`).
2. Commit `package.json` and `package-lock.json`, then merge through a pull request.
3. Run **Release and publish** on `master` in GitHub Actions.

The workflow checks and builds the package, publishes to npm, and creates a GitHub release tagged at the built commit. unpkg and jsDelivr serve the npm package automatically. GitHub Pages updates the docs and demo on pushes to master.

For a beta, use `npm version preminor --preid=beta --no-git-tag-version`. Increment it with `prerelease`, or promote it with `patch`. Prereleases publish under `@beta`. Stable releases use `@latest`.

If publication fails, fix the cause and rerun. If npm succeeded but GitHub release creation failed, create the GitHub release at the workflow's commit without publishing again. Published npm versions cannot be overwritten.

## Repository settings

- **npm:** add a [trusted publisher](https://docs.npmjs.com/trusted-publishers/) for `Eoic/ASCIIGround`, workflow `release.yml`. Leave the environment blank and allow `npm publish`.
- **GitHub Pages:** set the source to **GitHub Actions**.
- **Codecov:** add the `CODECOV_TOKEN` repository secret.
- **Branch protection:** require pull requests and passing CI on `master`.
