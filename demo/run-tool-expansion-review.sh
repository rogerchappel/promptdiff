#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

rm -rf .promptdiff-demo
mkdir -p .promptdiff-demo

npm run build

set +e
node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out .promptdiff-demo/tool-expansion.md \
  --fail-on high
compare_status=$?
set -e

if [ "$compare_status" -ne 2 ]; then
  echo "expected compare to trip the high-severity gate, got $compare_status" >&2
  exit 1
fi

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --format json \
  --out .promptdiff-demo/tool-expansion.json

node dist/cli.js check \
  examples/prompts/safe.md \
  --rules examples/rules.json \
  --out .promptdiff-demo/rules-check.md

grep -q "PromptDiff Compare Report" .promptdiff-demo/tool-expansion.md
grep -q "tool" .promptdiff-demo/tool-expansion.md
grep -q '"highestSeverity"' .promptdiff-demo/tool-expansion.json
grep -q "PromptDiff Rules Check" .promptdiff-demo/rules-check.md

echo "promptdiff demo ok: wrote .promptdiff-demo/tool-expansion.* and rules-check.md"
