# Working on issues with Codex

Start a fresh chat for each issue. Select **Worktree**, choose an up-to-date `master`, and invoke the
[work-issue skill](.agents/skills/work-issue/SKILL.md) by name or through the skill picker.

Example prompt:

> Use work-issue to implement #38. Check its expected results, keep the change minimal, and use a separate
> subagent to review the completed diff. Run the relevant checks and show me the changes for review.
> Wait for my explicit approval before committing or pushing. After approval, open a short PR and update
> the ASCIIGround project status. Leave merging to me.

Review the final diff and check results before approving commits or pushes. A PR request does not replace
this approval. Later edits, including review and CI fixes, must be reviewed and approved before delivery.

## Parallel work

Use separate worktrees for independent issues. Within an issue, the main agent coordinates implementation
and can delegate investigation or review. Give each subagent a specific task and clear ownership of any files it edits.

Start with two issues at a time. Sequence issues that change the same code or depend on each other.
For example, Canvas 2D optimization and WebGL work both affect rendering and need coordination.

## Resuming work

Continue in the issue's chat when possible. To move to a fresh chat, request a short handoff containing
the issue link, branch/worktree, decisions, checks completed, and remaining work. Ask the new chat to verify
that summary against the current code and PR.

Keep lasting requirements in the issue and implementation details in its PR. Update project status as work
starts, enters review, and merges. Keep shared repository rules in [AGENTS.md](AGENTS.md).
