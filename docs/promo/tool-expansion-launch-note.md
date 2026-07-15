# Launch Note Draft: Prompt Tool Expansion Review

PromptDiff now has a ready-to-run demo for reviewing prompt edits that expand
tool access, remove guardrails, and change output contracts.

## What to run

```sh
bash demo/run-tool-expansion-review.sh
```

The script builds the CLI and writes:

- `.promptdiff-demo/tool-expansion.md`
- `.promptdiff-demo/tool-expansion.json`
- `.promptdiff-demo/rules-check.md`

It also verifies that the `--fail-on high` gate trips for the risky prompt
revision.

## Why it matters

Prompt changes can look like ordinary copy edits while changing what an agent is
allowed to do. This demo turns that change into review evidence: Markdown for
humans, JSON for automation, and a rules check for prompt quality gates.

## Limits

PromptDiff is deterministic and heuristic. It does not use an LLM judge, does
not make hidden network calls, and does not decide whether a prompt should ship.
It names concrete review signals so a human reviewer can make the decision.
