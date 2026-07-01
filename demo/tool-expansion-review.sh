#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/promptdiff-demo"
check_out="$out_dir/rules-check.json"

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

node dist/cli.js check \
  examples/prompts/safe.md \
  --rules examples/rules.json \
  --fail-on high \
  --format json > "$check_out"

test "$compare_status" -ne 0
test -s "$out_dir/tool-expansion.md"
test -s "$out_dir/tool-expansion.json"
test -s "$check_out"
grep -q "PromptDiff Compare Report" "$out_dir/tool-expansion.md"
grep -q '"highestSeverity"' "$out_dir/tool-expansion.json"

echo "Markdown review report: $out_dir/tool-expansion.md"
echo "JSON review report: $out_dir/tool-expansion.json"
echo "Rules check: $check_out"
echo "Expected high-risk gate exit: $compare_status"
