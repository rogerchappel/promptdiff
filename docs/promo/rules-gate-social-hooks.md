# Rules Gate Social Hooks

- "Prompt reviews need a gate that says exactly which rule failed."
- "PromptDiff can archive a passing prompt check and a high-risk failure from local fixtures."
- "A prompt rules gate should produce Markdown for reviewers and an exit code for automation."
- "This demo is deterministic: it checks committed prompt fixtures against committed rules."

## Demo command

```sh
bash demo/rules-gate-smoke.sh
```

## Grounded talking points

- `examples/prompts/safe.md` passes `examples/rules.json`.
- `examples/prompts/v2.md` is expected to fail with exit status `2` when
  `--fail-on high` is enabled.
- Reports are written locally under a temporary directory.
