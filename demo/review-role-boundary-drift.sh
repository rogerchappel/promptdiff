#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/promptdiff-role-boundary"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build >/dev/null

node dist/cli.js compare \
  examples/prompts/role-boundary-old.md \
  examples/prompts/role-boundary-new.md \
  --format markdown \
  --out "$OUT_DIR/role-boundary.md"

node dist/cli.js compare \
  examples/prompts/role-boundary-old.md \
  examples/prompts/role-boundary-new.md \
  --format json \
  --out "$OUT_DIR/role-boundary.json"

test -s "$OUT_DIR/role-boundary.md"
test -s "$OUT_DIR/role-boundary.json"
grep -Fq "Tool surface changed" "$OUT_DIR/role-boundary.md"
grep -Fq "Output contract changed" "$OUT_DIR/role-boundary.md"
grep -Fq '"highestSeverity"' "$OUT_DIR/role-boundary.json"

printf 'Markdown report: %s\n' "$OUT_DIR/role-boundary.md"
printf 'JSON report: %s\n' "$OUT_DIR/role-boundary.json"
