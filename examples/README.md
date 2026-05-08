# PromptDiff Examples

- `prompts/v1.md` is a safer baseline support-agent prompt.
- `prompts/v2.md` intentionally adds dangerous instruction language, broader tools, an output-contract change, and a fake secret-shaped token.
- `prompts/safe.md` is used by the rules smoke check.
- `rules.json` demonstrates required phrases, forbidden phrases, required Markdown sections, and a `maxSeverity` gate.
- `prompt.json` and `jsonl/prompts.jsonl` exercise non-Markdown parsers.

Try:

```bash
npm run build
node dist/cli.js compare examples/prompts/v1.md examples/prompts/v2.md --out /tmp/promptdiff.md
node dist/cli.js check examples/prompts/safe.md --rules examples/rules.json
```
