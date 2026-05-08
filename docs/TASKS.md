# PromptDiff Tasks

## Wave 1 — Scaffold
- Generate TypeScript OSS CLI project with StackForge.
- Copy the PRD into docs/PRD.md.
- Add orchestration notes and machine-readable orchestration plan.

## Wave 2 — Core analysis
- Parse prompt/template revisions from Markdown, text, JSON, and JSONL files.
- Produce deterministic compare results with stable risk scoring.
- Detect risky instruction, tool, output-contract, secret, and rules changes.

## Wave 3 — CLI UX
- Implement `promptdiff compare` with Markdown and JSON outputs.
- Implement `promptdiff check` for rules-file quality gates.
- Keep all operations local-first with no telemetry and no network calls.

## Wave 4 — Evidence
- Add fixtures, unit tests, smoke scripts, and validation script.
- Document quick start, examples, safety model, contributing, and limitations.

## Wave 5 — Publish readiness
- Commit changes atomically, push to public GitHub main, set metadata/topics, and protect main best-effort.
