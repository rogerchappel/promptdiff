# Social Hooks

These drafts are grounded in the current README, examples, and CLI behavior.

## Prompt Tool Review

Prompt edits can quietly change tool access, safety language, and output contracts.

PromptDiff gives those changes names in a local Markdown or JSON report, so reviewers can discuss the actual risk instead of eyeballing a wall of text.

Demo: compare `examples/prompts/tool-expansion-old.md` with `examples/prompts/tool-expansion-new.md`.

## CI Angle

PromptDiff has two useful modes:

- `compare` for prompt revision reports
- `check` for required phrases, forbidden phrases, and section rules

It is deterministic, local-first, and built for review evidence rather than scoring prompts with another model.

## Limitation-Aware Post

PromptDiff is not an LLM judge and does not claim to understand every semantic change.

That is the point: it catches concrete review signals such as risky instruction language, removed guardrails, tool references, output-contract shifts, and secret-like values.
