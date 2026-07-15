#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build >/dev/null

rm -rf .tmp/promptdiff-demo
mkdir -p .tmp/promptdiff-demo

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out .tmp/promptdiff-demo/tool-expansion.md

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --format json \
  --out .tmp/promptdiff-demo/tool-expansion.json

set +e
node dist/cli.js check examples/prompts/*.md --rules examples/rules.json --fail-on high \
  --out .tmp/promptdiff-demo/rules-check.md
gate_code=$?
set -e

if [ "$gate_code" -ne 2 ]; then
  printf 'expected rules quality gate to exit 2, got %s\n' "$gate_code" >&2
  exit 1
fi

grep -q "Tool" .tmp/promptdiff-demo/tool-expansion.md
grep -q "highestSeverity" .tmp/promptdiff-demo/tool-expansion.json
grep -q "PromptDiff" .tmp/promptdiff-demo/rules-check.md
node -e "const fs=require('node:fs'); const report=JSON.parse(fs.readFileSync('.tmp/promptdiff-demo/tool-expansion.json','utf8')); if (!report.summary || !Array.isArray(report.findings)) process.exit(1);"

printf 'Markdown report: .tmp/promptdiff-demo/tool-expansion.md\n'
printf 'JSON report: .tmp/promptdiff-demo/tool-expansion.json\n'
printf 'Rules report: .tmp/promptdiff-demo/rules-check.md\n'
