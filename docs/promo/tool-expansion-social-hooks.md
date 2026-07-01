# Tool Expansion Social Hooks

## Short Posts

1. A prompt change can quietly add shell or browser access, remove a secret
   guardrail, and change the output format. PromptDiff turns that into a local
   Markdown or JSON review artifact.
2. Treat prompt revisions like code review. `promptdiff compare old.md new.md`
   gives reviewers named findings for instruction, tool, secret, and output
   contract changes.
3. The useful prompt review question is not "did the text change?" It is "did
   the agent's authority or contract change?" PromptDiff is a small local CLI
   for that check.

## Demo Command

```sh
bash demo/run-tool-expansion-review.sh
```

## Grounding Notes

- The demo uses checked-in fixtures under `examples/prompts/`.
- The generated reports are written under `/tmp/promptdiff-tool-expansion-demo`.
- PromptDiff is deterministic and heuristic; it is not an LLM judge.
- Do not claim the tool proves a prompt is safe.
