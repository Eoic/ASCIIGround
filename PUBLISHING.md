# Publishing

## Release

1. On a branch from `development`, merge the latest `origin/master` to include previous release history. Run `npm version patch --no-git-tag-version` (or `minor` / `major`).
2. Commit `package.json` and `package-lock.json`, then merge a pull request into `development` using a merge commit.
3. Open a release PR from `development` to `master`. Merge it with a merge commit after CI passes.
4. Run **Release and publish** on `master` in GitHub Actions.

The workflow checks and builds the package, publishes to npm, and creates a GitHub release tagged at the built commit. unpkg and jsDelivr serve the npm package automatically.

GitHub Pages deploys the latest docs and demo from `development`. `master` remains the default branch and receives release PRs only. Feature and fix PRs target `development`.

The docs selector includes development and every stable npm version. Release docs at `versions/<version>/` use that package's README and API declarations.

A successful release verifies npm availability, docs deployment, and the live version page. To rebuild docs manually, run **Deploy documentation and examples** on `development`. Its optional `version` input defaults to the latest GitHub release.

Build development docs with `npm run build:docs`, or include published versions with `npm run build:docs:versions` (requires npm registry access).

For a beta, use `npm version preminor --preid=beta --no-git-tag-version`. Increment it with `prerelease`, or promote it with `patch`. Prereleases publish under `@beta`. Stable releases use `@latest`.

If publication fails, fix the cause and rerun. If npm succeeded but GitHub release creation failed, create the GitHub release at the workflow's commit without publishing again. Published npm versions cannot be overwritten.

If **Verify package and documentation** fails, rerun only the failed jobs after resolving the cause. The completed publishing job does not need to run again. Verification retries temporary registry and Pages delays, then fails if the release is still unavailable.

## Repository settings

- **npm:** add a [trusted publisher](https://docs.npmjs.com/trusted-publishers/) for `Eoic/ASCIIGround`, workflow `release.yml`. Leave the environment blank and allow `npm publish`.
- **GitHub Pages:** set the source to **GitHub Actions** and allow only `development` in the `github-pages` environment's deployment branches.
- **Codecov:** add the `CODECOV_TOKEN` repository secret.
- **Branch protection:** require pull requests and passing CI on `master` and `development`. Require **Release source** on `master` and allow merge commits only for release PRs.
