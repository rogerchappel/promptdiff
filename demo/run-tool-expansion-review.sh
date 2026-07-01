#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-tool-expansion"
MARKDOWN_REPORT="$OUT_DIR/tool-expansion-review.md"
JSON_REPORT="$OUT_DIR/tool-expansion-review.json"
RULES_REPORT="$OUT_DIR/safe-prompt-rules.md"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build >/dev/null

set +e
node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out "$MARKDOWN_REPORT"
markdown_status=$?

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --format json \
  --out "$JSON_REPORT"
json_status=$?
set -e

node dist/cli.js check \
  examples/prompts/safe.md \
  --rules examples/rules.json \
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
