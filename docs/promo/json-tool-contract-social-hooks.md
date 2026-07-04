# JSON Tool Contract Hooks

Grounding: `examples/json-contract-demo.sh` compares the checked-in JSON prompt
fixtures under `examples/json/`, captures Markdown and JSON reports, and expects
the high-severity gate to exit `2`.

## Short Posts

1. Prompt reviews are not only Markdown reviews. PromptDiff now has a runnable
   JSON tool-contract demo that catches added `shell` and `browser` access plus
   an output format change.

2. If your agent profile lives in JSON, a plain text diff can miss the review
   story. PromptDiff produces deterministic local evidence for tool access,
   override-style instructions, and output-contract changes.

3. The new JSON fixture demo shows PromptDiff failing closed on a high-risk
   tool expansion. It writes both Markdown for reviewers and JSON for scripts.

## Video Angle

Show the old and new JSON prompt profiles side by side. Run the demo, pause on
the exit code `2`, then open the Markdown report and JSON report to show the
same risk evidence in human and machine-readable forms.

## Limits To Mention

- PromptDiff is deterministic and heuristic, not an LLM judge.
- The demo uses intentionally risky fixtures.
- Reports are local files; no hosted service or telemetry is involved.
