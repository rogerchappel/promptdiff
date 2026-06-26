#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/promptdiff-rules-gate"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build >/dev/null

node dist/cli.js check examples/prompts/safe.md \
  --rules examples/rules.json \
  --out "$out_dir/safe-check.md"

set +e
node dist/cli.js check examples/prompts/v2.md \
  --rules examples/rules.json \
  --fail-on high \
  --out "$out_dir/risky-check.md" \
  >"$out_dir/risky-check.stdout" \
  2>"$out_dir/risky-check.stderr"
risky_status=$?
set -e

test "$risky_status" -eq 2
grep -q "PromptDiff Rules Check" "$out_dir/safe-check.md"
grep -q "PromptDiff Rules Check" "$out_dir/risky-check.md"
grep -q "ignore previous instructions" "$out_dir/risky-check.md"
grep -q "protect customer secrets" "$out_dir/risky-check.md"

{
  printf '# PromptDiff Rules Gate Smoke\n\n'
  printf '| Prompt | Expected result | Artifact |\n'
  printf '|---|---|---|\n'
  printf '| examples/prompts/safe.md | pass | safe-check.md |\n'
  printf '| examples/prompts/v2.md | exit 2 with high-risk findings | risky-check.md |\n'
} >"$out_dir/summary.md"

echo "Safe rules check: $out_dir/safe-check.md"
echo "Risky rules check: $out_dir/risky-check.md"
echo "Risky gate exit: $risky_status"
echo "Summary: $out_dir/summary.md"
