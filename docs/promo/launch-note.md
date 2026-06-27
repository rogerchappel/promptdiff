# PromptDiff launch note draft

PromptDiff is a local-first CLI for reviewing prompt revisions like code. It
compares Markdown, text, JSON, and JSONL prompt files, then reports risky
instruction changes, tool-surface changes, output-contract changes, and removed
guardrails.

## Demo

```sh
npm install
npm run build
bash demo/review-tool-expansion.sh
```

The demo uses the committed `examples/prompts/tool-expansion-old.md` and
`examples/prompts/tool-expansion-new.md` files, then writes Markdown and JSON
reports under `demo/output/`.

## Useful proof points

- Runs locally with no telemetry or external network calls.
- Redacts common secret-like values by default.
- Produces deterministic Markdown or JSON for PR review.
- Includes a `check` command for simple required phrase, forbidden phrase, and
  required section gates.

## Limits to say plainly

PromptDiff is deterministic and heuristic. It is useful review evidence, not an
LLM judge, and reviewers should still read the underlying prompt change.
