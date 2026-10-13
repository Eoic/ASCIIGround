---
name: work-issue
description: Implement a GitHub issue in ASCIIGround, coordinating isolated work and review through a pull request when requested.
---

# Work on an issue

Read the issue, relevant comments, and the repository's `AGENTS.md`. Check the current code and related PRs
before editing. Treat the issue's expected results as the scope. Resolve material ambiguity before dependent work.

## Isolate the work

Use one branch and worktree per issue, starting from current `origin/master`. Reuse the current worktree
when it already belongs to this issue. Keep unrelated user changes intact. Give parallel issue implementations
separate worktrees and serialize work that depends on another issue or changes the same behavior.

## Delegate selectively

Use subagents for independent investigation or review when useful. Keep small tasks in the main agent.
For each assignment, provide the issue's goal, relevant files, constraints, and expected output.
Keep reviewers read-only. Give implementation agents an explicit worktree or exclusive file ownership.
Separate agent contexts do not isolate files.

Keep the main agent responsible for integration and acceptance criteria. Ask subagents to return findings,
file references, checks run, and unresolved concerns instead of raw logs. Review their results before proceeding.

## Validate and deliver

Implement the smallest complete change and follow the checks in `AGENTS.md`. Review the final diff against
the expected results and address substantive findings. Distinguish completed checks from checks that could not run.

When asked to deliver a PR, commit with a Conventional Commit message and open one PR for the issue.
Use `Closes #<number>` and describe the behavior change and validation briefly. Check CI and fix failures
caused by the change. Leave merging and publishing to the user unless requested.

When project updates are requested, use the existing ASCIIGround project statuses. An open PR is not completed work.

## Keep context useful

Read only the files needed for the current task. Keep requirements in the issue and delivery details in the PR.
If handing off unfinished work, summarize the issue, branch/worktree, decisions, checks, and next step in the chat.
Resume by checking the current issue, Git state, and diff. Avoid extra plan or progress files unless requested.
