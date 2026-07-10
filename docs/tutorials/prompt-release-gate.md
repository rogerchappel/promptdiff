# Prompt Release Gate

This recipe shows how to use PromptDiff as a local prompt release gate before a prompt revision reaches review.

## Inputs

- Old prompt: `examples/prompts/tool-expansion-old.md`
- New prompt: `examples/prompts/tool-expansion-new.md`
- Rules file: `examples/rules.json`

The new prompt intentionally expands tool language, changes the expected output shape, and removes a secret-handling guardrail. That makes it useful as a deterministic fixture for demos and CI examples.

## Run the demo

```sh
npm run build
bash examples/release-gate-demo.sh
```

The compare command is expected to exit `2` because `--fail-on high` is enabled. The script treats that as the correct gate behavior and verifies that the Markdown report was written.

## What to attach to a review

Attach the generated `tool-expansion-review.md` report when the gate fails. It gives reviewers a stable summary of the risky changes without requiring them to infer policy impact from a text diff alone.

Use the rules check output when you want to show that a known-safe prompt still satisfies required phrases, forbidden phrases, and required sections.
