# Review Agent Tool Expansion

This recipe shows how to use PromptDiff when a prompt change gives an agent broader tool access and changes the report format.

## Files

- `examples/prompts/tool-expansion-old.md`: a support triage prompt with human-review and secret-handling guardrails.
- `examples/prompts/tool-expansion-new.md`: a revised prompt that adds browser and shell tool language, removes the explicit secret-handling guardrail, and changes the output contract to JSON.

## Run the demo

```bash
npm run build
node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --out demo-tool-expansion.md
node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --format json
```

## What to look for

PromptDiff should flag the review-relevant changes rather than merely showing a text diff:

- instruction risk from the "ignore previous restrictions" language
- tool-surface expansion from browser and shell references
- removed secret-handling language
- output-contract change from Markdown sections to JSON fields

Use the Markdown report as a pull-request appendix. Use the JSON output when a CI job or agent runner needs a machine-readable decision.

## Review note template

```md
PromptDiff found tool-access and output-contract changes in this prompt revision.

Manual review should confirm:

- whether browser and shell tools are allowed for this agent
- whether the removed customer-secret guardrail is intentional
- whether downstream parsers are ready for the JSON output contract
```
