# PromptDiff Tasks

## Completed for MVP

- [x] Generate TypeScript OSS CLI project with StackForge.
- [x] Copy the source PRD into `docs/PRD.md`.
- [x] Add `docs/ORCHESTRATION.md` and `docs/orchestration.json`.
- [x] Parse Markdown, text, JSON, and JSONL prompt fixtures.
- [x] Redact common token/key/password shapes by default.
- [x] Compare two prompt/template revisions with deterministic line deltas.
- [x] Classify risky instruction, safety-removal, tool-surface, output-contract, secret, and content changes.
- [x] Render stable Markdown and JSON reports.
- [x] Implement `promptdiff compare`.
- [x] Implement `promptdiff check` with JSON rules files.
- [x] Support `--fail-on`, `--format`, `--out`, and `--no-redact` flags.
- [x] Add fixtures under `examples/`.
- [x] Add tests under `tests/`.
- [x] Add smoke and validation scripts.
- [x] Document quick start, examples, safety model, contributing, limitations, and local verification.

## Follow-up ideas

- Add SARIF output for code scanning integrations.
- Add richer section-aware Markdown comparison.
- Add configurable classifier keyword packs.
- Add a `promptdiff explain` command that prints why each heuristic fired.
- Add package publishing automation after a tagged release is reviewed.
