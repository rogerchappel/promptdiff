#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build

report_dir="${TMPDIR:-/tmp}/promptdiff-demo"
mkdir -p "$report_dir"

node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --format markdown --out "$report_dir/prompt-change.md"
node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --format json --out "$report_dir/prompt-change.json"

set +e
node dist/cli.js check examples/prompts/safe.md --rules examples/rules.json --fail-on high > "$report_dir/rules-check.txt"
check_status=$?
set -e

if [ "$check_status" -ne 0 ]; then
  echo "promptdiff check failed unexpectedly with exit code $check_status" >&2
  exit "$check_status"
fi

grep -Eq "instruction|tool|output|severity|Summary" "$report_dir/prompt-change.md"
grep -Eq '"findings"|"summary"|"severity"' "$report_dir/prompt-change.json"

echo "PromptDiff demo reports written to $report_dir"
