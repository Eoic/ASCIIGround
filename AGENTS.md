# Agent instructions

ASCIIGround is a TypeScript library for animated ASCII backgrounds. The public API is in
`src/index.ts`, rendering in `src/rendering`, patterns in `src/patterns`, and demo controls in `src/demo`.

- Keep changes focused and use existing tools and conventions. Add abstractions or helper scripts only when needed.
- Keep prose and PR descriptions short and concrete. Never use semicolons in prose. Keep semicolons in TypeScript.
- Never use em dashes in any output, including documentation, comments, UI text, PR descriptions, and messages.
- Follow nearby code and the ESLint configuration. Consult [Code style](.github/AI_CODE_STYLE_GUIDE.md) when needed.
- Test observable behavior through public APIs. Tests live in `src/__tests__` and use Vitest with canvas mocks.
- Preserve dirty tracking and resource cleanup when changing patterns or renderers. Check visual changes in a browser.

Complete the changes and checks, then present the diff and validation results for user review. Do not commit
or push until the user explicitly approves those actions for the reviewed changes. A request to implement
an issue or open a PR does not by itself authorize committing or pushing. Later edits, including review or
CI fixes, need review and approval before another commit or push.

Use the Node version in `.nvmrc` and install with `npm ci`. Run focused tests while developing and
`npm run check` before submitting code changes. For documentation-only changes, check links and `git diff --check`.

For GitHub issue implementation, use the [work-issue skill](.agents/skills/work-issue/SKILL.md).
The [issue workflow guide](ISSUE_WORKFLOW.md) explains how to start and resume work.
