# PromptDiff Roadmap

## Now: local CLI MVP

- Compare prompt/template revisions.
- Classify risky instruction, tool, and output-contract changes.
- Render deterministic Markdown and JSON.
- Run local rules checks with quality-gate exit codes.

## Next

- SARIF output for CI/code scanning workflows.
- Section-aware Markdown comparison.
- Configurable classifier keyword packs.
- More examples for agentic coding, support, and tool-calling prompts.

## Later

- Release automation for npm once the CLI has external dogfood mileage.
- Optional machine-readable baseline files for teams that want approved risk deltas.
- Integrations with pre-commit and GitHub Actions examples.

## Non-goals

- Hosted dashboard.
- Telemetry.
- LLM judging in the default path.
- Uploading prompt contents anywhere.
