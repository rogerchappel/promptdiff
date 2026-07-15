# Tool Expansion Demo Notes

## Angle

PromptDiff makes a risky prompt edit reviewable: broader shell/browser language, removed secret-handling guidance, and an output contract change become named findings.

## Demo command

```bash
bash demo/run-tool-expansion-review.sh
```

The script writes:

- `/tmp/promptdiff-demo/tool-expansion.md`
- `/tmp/promptdiff-demo/tool-expansion.json`

It also runs the Markdown comparison with `--fail-on high`, so exit code `2` is expected when the fixture crosses that threshold.

## Social hooks

- Prompt changes can expand tool access without looking dramatic in a text diff. PromptDiff names those changes for review.
- Treat prompts like code: compare the old and new instruction files, produce a deterministic Markdown report, and fail a local gate on high-risk changes.
- This demo uses checked-in prompt fixtures. No hosted judging, no telemetry, no hidden writes unless `--out` is provided.

## Limitation

PromptDiff is deterministic and heuristic. It is useful review evidence, not a replacement for reading the prompt change.
