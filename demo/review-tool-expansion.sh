#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/demo/output"

mkdir -p "${OUT_DIR}"

node "${ROOT_DIR}/dist/cli.js" compare \
  "${ROOT_DIR}/examples/prompts/tool-expansion-old.md" \
  "${ROOT_DIR}/examples/prompts/tool-expansion-new.md" \
  --format markdown \
  --out "${OUT_DIR}/tool-expansion-report.md"

node "${ROOT_DIR}/dist/cli.js" compare \
  "${ROOT_DIR}/examples/prompts/tool-expansion-old.md" \
  "${ROOT_DIR}/examples/prompts/tool-expansion-new.md" \
  --format json \
  --out "${OUT_DIR}/tool-expansion-report.json"

node "${ROOT_DIR}/dist/cli.js" check \
  "${ROOT_DIR}/examples/prompts/safe.md" \
  --rules "${ROOT_DIR}/examples/rules.json" \
  --fail-on high

test -s "${OUT_DIR}/tool-expansion-report.md"
test -s "${OUT_DIR}/tool-expansion-report.json"

printf 'Wrote %s\n' "${OUT_DIR}/tool-expansion-report.md"
printf 'Wrote %s\n' "${OUT_DIR}/tool-expansion-report.json"
