#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/promptdiff-demo"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build

set +e
node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out "$out_dir/tool-expansion.md" \
  --fail-on high
compare_status=$?
set -e

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --format json \
  --out "$out_dir/tool-expansion.json"

test "$compare_status" -ne 0
test -s "$out_dir/tool-expansion.md"
test -s "$out_dir/tool-expansion.json"
grep -q "PromptDiff Compare Report" "$out_dir/tool-expansion.md"
grep -q '"highestSeverity"' "$out_dir/tool-expansion.json"

echo "Markdown review report: $out_dir/tool-expansion.md"
echo "JSON review report: $out_dir/tool-expansion.json"
echo "Expected high-risk gate exit: $compare_status"
