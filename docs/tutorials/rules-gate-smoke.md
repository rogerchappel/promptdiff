# Rules Gate Smoke

This recipe shows PromptDiff as a deterministic local rules gate for prompt
fixtures. It captures one passing prompt and one prompt that should fail the
configured quality gate.

## Run it

```sh
npm install
bash demo/rules-gate-smoke.sh
```

The script writes reports under `${TMPDIR:-/tmp}/promptdiff-rules-gate`:

- `safe-check.md`
- `risky-check.md`
- `summary.md`

## Fixtures used

- `examples/prompts/safe.md` contains the required sections and
  secret-handling phrase from `examples/rules.json`.
- `examples/prompts/v2.md` contains risky instruction language and a changed
  output contract, so the demo asserts that `--fail-on high` exits with status
  `2`.

## Review use

Use the safe report to show the expected shape of a passing rules check. Use the
risky report when explaining how CI or a release checklist can preserve prompt
review evidence without relying on an LLM judge.
