# Review A JSON Tool Contract

PromptDiff supports JSON inputs as well as Markdown prompts. Use this recipe
when a prompt or agent profile is stored as structured configuration and the
review needs to catch tool access, instruction hierarchy, and output-contract
changes.

## Run The Demo

```sh
npm install
bash examples/json-contract-demo.sh
```

The demo compares `examples/json/tool-contract-old.json` with
`examples/json/tool-contract-new.json`. The new fixture adds `shell` and
`browser`, removes the explicit human-review instruction, adds override-style
language, and changes the output format from JSON to Markdown.

## Manual Commands

```sh
npm run build
node dist/cli.js compare examples/json/tool-contract-old.json examples/json/tool-contract-new.json --out /tmp/tool-contract-review.md --fail-on high
node dist/cli.js compare examples/json/tool-contract-old.json examples/json/tool-contract-new.json --format json
```

Expected behavior:

- the `--fail-on high` command exits `2`
- the Markdown report names the added tool surface
- the JSON report includes at least one high-severity finding

## Why This Helps

Structured prompt files often bypass normal prose review. This fixture-backed
demo gives reviewers a deterministic local check before a JSON prompt profile is
merged into an agent runtime.
