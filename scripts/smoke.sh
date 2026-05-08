#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

rm -rf .promptdiff-smoke
mkdir -p .promptdiff-smoke

node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --out .promptdiff-smoke/report.md || test "$?" -eq 0
node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --format json --out .promptdiff-smoke/report.json || test "$?" -eq 0
node dist/cli.js check examples/prompts/safe.md --rules examples/rules.json --out .promptdiff-smoke/check.md

if ! grep -q "Dangerous instruction added" .promptdiff-smoke/report.md; then
  echo "missing expected compare finding" >&2
  exit 1
fi

if ! grep -q '"highestSeverity": "critical"' .promptdiff-smoke/report.json; then
  echo "missing expected json severity" >&2
  exit 1
fi

if ! grep -q "PromptDiff Rules Check" .promptdiff-smoke/check.md; then
  echo "missing expected rules report" >&2
  exit 1
fi

echo "smoke ok"
