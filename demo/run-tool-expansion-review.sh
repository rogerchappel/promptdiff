#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="/tmp/promptdiff-demo"
REPORT_MD="$OUT_DIR/tool-expansion.md"
REPORT_JSON="$OUT_DIR/tool-expansion.json"

cd "$ROOT"
mkdir -p "$OUT_DIR"

npm run build

set +e
node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --out "$REPORT_MD" --fail-on high
status=$?
set -e

if [ "$status" -ne 0 ] && [ "$status" -ne 2 ]; then
  echo "promptdiff compare failed with exit code $status" >&2
  exit "$status"
fi

node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --format json > "$REPORT_JSON" || true
node -e "const fs=require('node:fs'); const report=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if (!report.summary || !Array.isArray(report.findings)) process.exit(1);" "$REPORT_JSON"

echo "Markdown report: $REPORT_MD"
echo "JSON report: $REPORT_JSON"
echo "Compare exit code with --fail-on high: $status"
