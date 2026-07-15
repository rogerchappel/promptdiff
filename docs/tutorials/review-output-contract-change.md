# Review an Output Contract Change

This walkthrough uses the checked-in `examples/prompts/v1.md` and `examples/prompts/v2.md` fixtures to show how PromptDiff creates review evidence for prompt revisions.

## Scenario

A prompt changes between two versions. The reviewer needs to know whether the edit changes instructions, tool language, safety posture, or the output contract that downstream code expects.

## Run the demo

```sh
npm install
bash demo/review-output-contract-change.sh
```

The script builds the CLI, compares the prompt fixtures in Markdown and JSON formats, and runs the sample rules check against `examples/prompts/safe.md`.

Reports are written under `${TMPDIR:-/tmp}/promptdiff-demo`:

- `prompt-change.md`
- `prompt-change.json`
- `rules-check.txt`

## Use in review

Read the Markdown report first:

```sh
sed -n '1,160p' "${TMPDIR:-/tmp}/promptdiff-demo/prompt-change.md"
```

Keep the JSON report for CI, bots, or later automation that needs stable fields instead of prose.

## Limitations

PromptDiff is deterministic and heuristic. It is designed to make risky prompt edits easier to review, not to replace domain-specific evaluation.
