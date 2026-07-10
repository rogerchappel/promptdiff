#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-release-gate-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build

set +e
node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out "$OUT_DIR/tool-expansion-review.md" \
  --fail-on high
COMPARE_STATUS=$?
set -e

test "$COMPARE_STATUS" -eq 2
test -s "$OUT_DIR/tool-expansion-review.md"
grep -qi "tool" "$OUT_DIR/tool-expansion-review.md"
grep -qi "high" "$OUT_DIR/tool-expansion-review.md"

node dist/cli.js check examples/prompts/safe.md --rules examples/rules.json --out "$OUT_DIR/rules-check.md"
test -s "$OUT_DIR/rules-check.md"
grep -qi "PromptDiff" "$OUT_DIR/rules-check.md"

echo "Review report: $OUT_DIR/tool-expansion-review.md"
echo "Rules check: $OUT_DIR/rules-check.md"
echo "Gate exit: $COMPARE_STATUS"
