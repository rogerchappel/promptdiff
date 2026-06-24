# Launch Note Draft

PromptDiff is a local-first CLI for reviewing prompt and template changes with
deterministic evidence.

It focuses on concrete review signals that are easy to miss in a plain text
diff:

- risky instruction language
- removed guardrails
- tool-surface changes
- output-contract changes
- secret-like values, redacted by default

## Demo

```sh
bash demo/tool-expansion-review.sh
```

The demo compares the checked-in tool-expansion prompt pair, writes Markdown and
JSON reports under `/tmp/promptdiff-demo`, and runs the example rules check
against `examples/prompts/safe.md`.

## Positioning

PromptDiff is useful when prompt changes need a pull-request appendix or a CI
gate that explains what changed without sending prompts to a hosted service.

## Limitations

PromptDiff is a deterministic heuristic tool, not an LLM judge. Reviewers should
use its report as evidence for manual review, not as a claim that every semantic
change was understood.
