# PromptDiff

PromptDiff treats prompts like code: compare revisions, call out risky behavior changes, and leave a tidy local report that reviewers can trust.

It is a small TypeScript CLI for developers and agent operators who want deterministic prompt review evidence without SaaS dashboards, telemetry, or hidden network calls.

## Why it exists

Prompt edits can quietly change instruction hierarchy, tool access, and output contracts. Those changes are easy to miss in a normal text diff but can break agents, parsers, and safety assumptions. PromptDiff gives those changes names.

## Install

```bash
npm install
npm run build
```

For local development, run the built CLI directly:

```bash
node dist/cli.js --help
```

After publishing/installing globally, use:

```bash
promptdiff --help
```

## Quick start

```bash
npm run build
node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --out prompt-risk.md
node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --format json
node dist/cli.js check examples/prompts/*.md --rules examples/rules.json --fail-on high
```

## Commands

### `compare`

Compares two prompt/template revisions and produces stable Markdown or JSON.

```bash
promptdiff compare old.md new.md --format markdown --out report.md --fail-on high
promptdiff compare old.json new.json --format json
```

It classifies:

- instruction changes, including dangerous “ignore/bypass/override” language
- removed safety/refusal/secret-handling guardrails
- tool surface changes such as shell, browser, network, delete, database, or email access
- output-contract changes such as JSON/schema/format shifts
- secret-like values, redacted before output by default

### `check`

Checks one or more prompt files against a simple JSON rules file.

```json
{
  "requiredPhrases": ["protect customer secrets"],
  "forbiddenPhrases": ["ignore previous instructions"],
  "requireSections": ["Role", "Instructions", "Output Contract"],
  "maxSeverity": "high"
}
```

```bash
promptdiff check prompts/*.md --rules promptdiff.rules.json --fail-on high
```

Exit code `2` means the configured quality gate failed. Exit code `1` means a command/runtime error.

## Supported inputs

- Markdown
- plain text
- JSON with stable key ordering
- JSONL / NDJSON with stable key ordering per line

## Safety model

- Local-first by design.
- No telemetry.
- No external network calls.
- No hidden file writes; files are written only when `--out` is provided.
- Redaction is enabled by default for common API key, token, password, and credential patterns.
- Reports use deterministic timestamps (`deterministic-local`) to avoid noisy snapshots.

## Limitations

PromptDiff is a deterministic heuristic tool, not an LLM judge. It is deliberately conservative and review-friendly. It will miss subtle semantic changes, and it may flag harmless text that looks like risky instruction/tool/output-contract language.

## Examples

Fixtures live in [`examples/`](examples/):

```bash
npm run build
node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md
node dist/cli.js check examples/prompts/safe.md --rules examples/rules.json
npm run smoke
```

For a reviewer-facing walkthrough, see [`docs/tutorials/review-agent-tool-expansion.md`](docs/tutorials/review-agent-tool-expansion.md). It demonstrates a prompt revision that expands browser and shell tool language, removes an explicit secret-handling guardrail, and changes the output contract.

For a one-command local demo that writes Markdown and JSON review artifacts:

```bash
bash demo/run-tool-expansion-review.sh
```

See [`docs/tutorials/tool-expansion-quality-gate.md`](docs/tutorials/tool-expansion-quality-gate.md)
for the quality-gate flow and [`docs/promo/social-hooks.md`](docs/promo/social-hooks.md)
for grounded launch copy.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## Contributing

Issues and small PRs are welcome. Please keep changes deterministic, local-first, and covered by fixtures/tests. If you add a new risk classifier, add one example prompt pair and one test that proves the report stays stable.

## License

MIT

## Release Readiness

Use the checked-in scripts before opening or publishing a release:

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

The package smoke uses `npm pack --dry-run` so the published file list can be reviewed without publishing.
