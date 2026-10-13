# Contributing

1. Follow the [development setup](README.md#development) and create a branch.
2. Make your changes and add relevant tests.
3. Run `npm run check`.
4. Commit and open a pull request. CI must pass before merging.

Use [Conventional Commits](https://www.conventionalcommits.org/), for example:

```text
fix: correct canvas resizing
feat: add a noise pattern
```

For breaking changes, add `!` after the type and explain the change in a `BREAKING CHANGE:` footer.

See [Publishing](PUBLISHING.md) for releases and [Code style](.github/AI_CODE_STYLE_GUIDE.md) for coding conventions.
