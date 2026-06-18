# PromptDiff Output Contract Video Brief

## Working title

Review prompt changes like code changes

## Source files

- `examples/prompts/v1.md`
- `examples/prompts/v2.md`
- `examples/rules.json`
- `demo/review-output-contract-change.sh`
- `docs/tutorials/review-output-contract-change.md`

## Demo flow

1. Show the two prompt fixtures and point out that a normal diff can bury behavior changes in prose.
2. Run `bash demo/review-output-contract-change.sh`.
3. Open `${TMPDIR:-/tmp}/promptdiff-demo/prompt-change.md`.
4. Open `${TMPDIR:-/tmp}/promptdiff-demo/prompt-change.json` to show automation-friendly output.
5. Close on the rule check as a small quality gate for required sections and forbidden phrases.

## Key points

- PromptDiff runs locally and does not call external services.
- Markdown output is for reviewers.
- JSON output is for CI, bots, or agent workflows.
- Findings are heuristic review evidence, not a model evaluation benchmark.
