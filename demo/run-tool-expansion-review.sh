#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-tool-expansion-demo"
MARKDOWN_REPORT="$OUT_DIR/tool-expansion-report.md"
JSON_REPORT="$OUT_DIR/tool-expansion-report.json"
RULES_REPORT="$OUT_DIR/rules-check.md"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm --prefix "$ROOT_DIR" run build >/dev/null

set +e
node "$ROOT_DIR/dist/cli.js" compare \
  "$ROOT_DIR/examples/prompts/tool-expansion-old.md" \
  "$ROOT_DIR/examples/prompts/tool-expansion-new.md" \
  --out "$MARKDOWN_REPORT"
markdown_status=$?

node "$ROOT_DIR/dist/cli.js" compare \
  "$ROOT_DIR/examples/prompts/tool-expansion-old.md" \
  "$ROOT_DIR/examples/prompts/tool-expansion-new.md" \
  --format json \
  --out "$JSON_REPORT"
json_status=$?
set -e

node "$ROOT_DIR/dist/cli.js" check \
  "$ROOT_DIR/examples/prompts/safe.md" \
  --rules "$ROOT_DIR/examples/rules.json" \
  --out "$RULES_REPORT"

test -s "$MARKDOWN_REPORT"
test -s "$JSON_REPORT"
test -s "$RULES_REPORT"
grep -q "Tool surface changed" "$MARKDOWN_REPORT"
grep -q '"highestSeverity": "critical"' "$JSON_REPORT"
grep -q "PromptDiff Rules Check" "$RULES_REPORT"

echo "Markdown report: $MARKDOWN_REPORT"
echo "JSON report: $JSON_REPORT"
echo "Rules report: $RULES_REPORT"
echo "Expected compare Markdown exit: $markdown_status"
echo "Expected compare JSON exit: $json_status"
find "$OUT_DIR" -maxdepth 1 -type f -print | sort
