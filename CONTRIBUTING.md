# Contributing

1. Follow the [development setup](README.md#development) and create a branch from `development`.
2. Make your changes and add relevant tests.
3. Run `npm run check`.
4. Commit and open a pull request targeting `development`. CI must pass before merging.

`master` is the default branch and contains releases. Release PRs merge `development` into `master`.

Dependabot version updates target `development`. Retarget security-update PRs there too, since [GitHub opens them against the default branch](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#target-branch).

Use [Conventional Commits](https://www.conventionalcommits.org/), for example:

```text
fix: correct canvas resizing
feat: add a noise pattern
```

For breaking changes, add `!` after the type and explain the change in a `BREAKING CHANGE:` footer.

See [Publishing](PUBLISHING.md) for releases and [Code style](.github/AI_CODE_STYLE_GUIDE.md) for coding conventions.

For agent-assisted development, see [Working on issues with Codex](ISSUE_WORKFLOW.md).
