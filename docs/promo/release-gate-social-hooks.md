# PromptDiff Release Gate Social Hooks

Use these only with the checked-in `examples/release-gate-demo.sh` workflow.

## Short posts

1. Prompt changes can add tool access, remove guardrails, or change output contracts without looking dramatic in a normal diff. PromptDiff turns that into a local report reviewers can inspect.
2. A small release gate for prompts: compare old/new files, fail on high-severity findings, and attach the Markdown report to the review.
3. PromptDiff is deliberately boring: local files in, deterministic Markdown or JSON out, no telemetry or hidden network calls.

## Demo thread

1. Start with the risky prompt pair in `examples/prompts/tool-expansion-old.md` and `examples/prompts/tool-expansion-new.md`.
2. Run `bash examples/release-gate-demo.sh`.
3. Show the exit code of `2` from `--fail-on high`, then open the generated Markdown report.
4. Point at the concrete categories: broader tool language, removed secret handling, and output contract changes.
5. Close with the safe check command against `examples/prompts/safe.md` and `examples/rules.json`.

## Video beat

Open on a normal prompt diff, then switch to the generated report. The useful moment is not "AI review"; it is the named checklist that a human reviewer can act on before a prompt ships.
