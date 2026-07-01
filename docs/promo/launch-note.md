# Launch Note Draft

PromptDiff is a local-first CLI for reviewing prompt and template revisions before they land in agents, support workflows, or CI-managed prompt libraries.

It compares old and new prompt files, names review-relevant changes, and emits deterministic Markdown or JSON. Current checks cover risky instruction language, removed safety and secret-handling guardrails, expanded tool access, output-contract changes, and secret-like values with redaction enabled by default.

## What to show

- `bash demo/run-tool-expansion-review.sh` for a fixture-backed prompt revision review.
- `node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --out prompt-risk.md` for a PR-ready Markdown report.
- `node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --format json` for automation-friendly evidence.
- `node dist/cli.js check examples/prompts/safe.md --rules examples/rules.json` for required phrase, forbidden phrase, and section checks.

## Positioning

PromptDiff is prompt review evidence, not another model judging your prompt. It gives concrete changes stable labels so reviewers can decide whether expanded tools, removed guardrails, or output-format changes were intentional.

## Honest limits

PromptDiff is deterministic and heuristic. It will not understand every semantic shift, prove that a prompt is safe, or replace human review for high-risk agent behavior.
