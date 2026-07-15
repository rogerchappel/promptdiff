# Tool Expansion Quality Gate Demo

This walkthrough creates reviewer-facing artifacts for a prompt change that
expands tool language and then runs the checked-in rules gate.

## Build the CLI

```sh
npm run build
```

## Compare the prompt revision

```sh
node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --out .tmp/promptdiff-demo/tool-expansion.md
```

Write JSON for automation:

```sh
node dist/cli.js compare \
  examples/prompts/tool-expansion-old.md \
  examples/prompts/tool-expansion-new.md \
  --format json \
  --out .tmp/promptdiff-demo/tool-expansion.json
```

## Run the rules gate

```sh
node dist/cli.js check examples/prompts/*.md --rules examples/rules.json --fail-on high \
  --out .tmp/promptdiff-demo/rules-check.md
```

Exit code `2` means the configured prompt quality gate failed. In this demo,
that is expected evidence for the risky fixture set, not a runtime error.

## One-command demo

```sh
bash demo/run-tool-expansion-review.sh
```

The script writes Markdown and JSON artifacts, verifies expected report text,
and confirms the rules gate exits with code `2`.

## Boundaries

- PromptDiff is deterministic and heuristic; it is not an LLM judge.
- Reports are review artifacts, not final safety decisions.
- Do not claim hosted scanning, telemetry, or network behavior.
