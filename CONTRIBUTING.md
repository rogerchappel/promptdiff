# Contributing to PromptDiff

Thanks for helping keep prompt review boring, local, and dependable.

## Development setup

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## Contribution principles

- Keep the default path local-first: no telemetry, no network calls, no hidden writes.
- Prefer deterministic heuristics over cleverness.
- Add fixtures for every new classifier or renderer behavior.
- Keep reports stable enough for snapshot-like review.
- Redact secret-like values before rendering unless a caller explicitly disables redaction.

## Adding a classifier

1. Add a focused fixture under `examples/`.
2. Add or update a test under `tests/`.
3. Keep severity choices explainable in the finding detail.
4. Update the README if users need to know about the new category.

## Commit style

Use Conventional Commits, for example:

- `feat: detect tool surface expansion`
- `fix: keep jsonl normalization stable`
- `test: cover rules fail-on behavior`
- `docs: add ci usage example`

## Pull request checklist

- [ ] The change is local-first and deterministic.
- [ ] Tests or smoke coverage were added where useful.
- [ ] `npm run check`, `npm test`, `npm run build`, and `npm run smoke` pass.
- [ ] Documentation was updated for user-visible behavior.
