# Tool Expansion Demo Script

This runnable demo compares the checked-in prompt pair that expands agent tool
access and changes review expectations.

## Run it

```sh
npm install
bash demo/tool-expansion-review.sh
```

The script builds PromptDiff, writes a Markdown report for reviewers, writes a
JSON report for automation, and asserts that the high-risk gate exits non-zero.

## Files used

- `examples/prompts/tool-expansion-old.md`
- `examples/prompts/tool-expansion-new.md`
- `docs/tutorials/review-agent-tool-expansion.md`

## Review angle

Use the Markdown report when explaining the human review workflow. Use the JSON
report when showing how CI or a release checklist can archive the same evidence.
