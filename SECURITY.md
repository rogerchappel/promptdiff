# Security Policy

PromptDiff is built for local prompt review. It should not make network calls or upload prompt contents in the default CLI path.

## Supported versions

The project is pre-1.0. Security fixes will target the current `main` branch until releases are formalized.

## Reporting a vulnerability

Please open a private GitHub security advisory or contact the maintainer through the repository owner profile. Do not paste real secrets into public issues.

## Security expectations

- Redaction is enabled by default.
- Secret-like prompt content should be represented as `<redacted>` in reports.
- `--no-redact` is for local debugging only.
- Commands write files only when `--out` is provided.
- Exit code `2` represents a policy/risk gate failure, not a runtime crash.

## Out of scope

PromptDiff is not a secret scanner, policy engine, or LLM safety evaluator. It catches common risky prompt-review patterns and should be used alongside normal code review and secret scanning.
