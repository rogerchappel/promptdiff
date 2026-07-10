#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-json-contract-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build

set +e
node dist/cli.js compare \
  examples/json/tool-contract-old.json \
  examples/json/tool-contract-new.json \
  --format markdown \
  --out "$OUT_DIR/tool-contract-review.md" \
  --fail-on high
COMPARE_STATUS=$?
set -e

test "$COMPARE_STATUS" -eq 2
test -s "$OUT_DIR/tool-contract-review.md"
grep -qi "shell" "$OUT_DIR/tool-contract-review.md"
grep -qi "browser" "$OUT_DIR/tool-contract-review.md"
grep -qi "Output contract" "$OUT_DIR/tool-contract-review.md"

node dist/cli.js compare \
  examples/json/tool-contract-old.json \
  examples/json/tool-contract-new.json \
  --format json >"$OUT_DIR/tool-contract-review.json"

test -s "$OUT_DIR/tool-contract-review.json"
grep -q '"severity": "high"' "$OUT_DIR/tool-contract-review.json"

printf 'PromptDiff JSON contract reports written to %s\n' "$OUT_DIR"
