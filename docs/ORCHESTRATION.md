# PromptDiff Orchestration

PromptDiff is intentionally boring to orchestrate: every command is local, deterministic, and safe to run inside CI or an agent loop without network access.

## Recommended pipeline

1. `npm ci`
2. `npm run check`
3. `npm test`
4. `npm run build`
5. `npm run smoke`
6. `bash scripts/validate.sh`
7. For each prompt PR, run:
   ```bash
   promptdiff compare prompts/base.md prompts/proposed.md --fail-on high --out promptdiff-report.md
   promptdiff check prompts/proposed.md --rules examples/rules.json --fail-on high
   ```

## Agent handoff contract

- Treat Markdown output as human review evidence.
- Treat JSON output as machine-readable gating evidence.
- Do not upload prompts or reports unless the calling workflow explicitly does so.
- Keep `--redact` enabled unless debugging a local fixture.
- Use non-zero exit code `2` as “quality gate failed”. Exit code `1` means command/runtime error.

## Determinism notes

- Report timestamps use `deterministic-local` to avoid noisy snapshots.
- JSON parsing sorts object keys.
- Line diff output is sorted so repeated runs are stable across platforms.
