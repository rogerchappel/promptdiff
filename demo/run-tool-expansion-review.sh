#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-tool-expansion-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm --prefix "$ROOT_DIR" run build >/dev/null

node "$ROOT_DIR/dist/cli.js" compare \
  "$ROOT_DIR/examples/prompts/tool-expansion-old.md" \
  "$ROOT_DIR/examples/prompts/tool-expansion-new.md" \
  --out "$OUT_DIR/tool-expansion-report.md"

node "$ROOT_DIR/dist/cli.js" compare \
  "$ROOT_DIR/examples/prompts/tool-expansion-old.md" \
  "$ROOT_DIR/examples/prompts/tool-expansion-new.md" \
  --format json \
  --out "$OUT_DIR/tool-expansion-report.json"

node "$ROOT_DIR/dist/cli.js" check \
  "$ROOT_DIR/examples/prompts/safe.md" \
  --rules "$ROOT_DIR/examples/rules.json" \
  --out "$OUT_DIR/rules-check.md"

grep -q "PromptDiff Compare Report" "$OUT_DIR/tool-expansion-report.md"
grep -q "Tool surface changed" "$OUT_DIR/tool-expansion-report.md"
grep -q '"highestSeverity"' "$OUT_DIR/tool-expansion-report.json"
grep -q "PromptDiff Rules Check" "$OUT_DIR/rules-check.md"

echo "Wrote PromptDiff demo reports to $OUT_DIR"
find "$OUT_DIR" -maxdepth 1 -type f -print | sort
