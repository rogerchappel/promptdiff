#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-demo"
MARKDOWN_OUT="$OUT_DIR/tool-expansion.md"
JSON_OUT="$OUT_DIR/tool-expansion.json"
CHECK_OUT="$OUT_DIR/rules-check.json"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out "$MARKDOWN_OUT"

node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --format json > "$JSON_OUT"

node dist/cli.js check \
  examples/prompts/safe.md \
  --rules examples/rules.json \
  --fail-on high \
  --format json > "$CHECK_OUT"

test -s "$MARKDOWN_OUT"
test -s "$JSON_OUT"
test -s "$CHECK_OUT"
grep -q "tool" "$MARKDOWN_OUT"
grep -q "findings" "$JSON_OUT"

echo "Markdown review: $MARKDOWN_OUT"
echo "JSON comparison: $JSON_OUT"
echo "Rules check: $CHECK_OUT"
