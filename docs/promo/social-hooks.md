# PromptDiff Promotion Hooks

## Grounded facts

- PromptDiff compares prompt revisions from local files.
- It emits Markdown or JSON reports.
- It redacts common secret-like values by default.
- It includes a `check` command backed by a JSON rules file.
- It is deterministic and heuristic, not an LLM judge.

## Short posts

1. Prompt changes can expand tool access without looking dramatic. PromptDiff
   turns that revision into a local review artifact.
2. Treat prompts like code: compare revisions, name risky categories, and keep
   a Markdown report with the PR.
3. Demo angle: old support prompt, new tool-expanded prompt, one report showing
   what changed and one rules gate that exits non-zero.

## Video outline

1. Open `examples/prompts/tool-expansion-old.md`.
2. Open `examples/prompts/tool-expansion-new.md`.
3. Run `bash demo/run-tool-expansion-review.sh`.
4. Show `.tmp/promptdiff-demo/tool-expansion.md`.
5. Show the expected quality-gate exit behavior from the script.
