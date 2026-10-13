#!/usr/bin/env bash
set -euo pipefail

npm run check

if command -v actionlint >/dev/null; then
    actionlint
else
    echo 'actionlint is unavailable.'
fi

if command -v shellcheck >/dev/null; then
    shellcheck scripts/*.sh
else
    echo 'shellcheck is unavailable'
fi

echo 'Local checks passed.'
