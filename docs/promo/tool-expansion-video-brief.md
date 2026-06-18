# Video Brief: Catch Risky Prompt Tool Expansion

## Angle

Show a prompt review where a normal-looking support-agent edit broadens tool access, removes secret-handling language, and changes the output contract.

## Grounded product facts

- PromptDiff is a local-first TypeScript CLI.
- It compares prompt revisions and emits Markdown or JSON reports.
- It redacts common secret-like values by default.
- It has a `check` command for JSON rule files.
- It does not use an LLM judge or make hidden network calls.

## Demo flow

1. Open `examples/prompts/tool-expansion-old.md` and point out the human-review and secret-handling lines.
2. Open `examples/prompts/tool-expansion-new.md` and highlight browser, shell, and JSON-output changes.
3. Run:

   ```bash
   npm run build
   node dist/cli.js compare examples/prompts/tool-expansion-old.md examples/prompts/tool-expansion-new.md --out demo-tool-expansion.md
   ```

4. Show the generated Markdown report and name the categories PromptDiff caught.
5. Close with the limitation: PromptDiff is deterministic and heuristic, so reviewers still make the final call.

For a fixture-backed script that also writes JSON and checks the high-risk exit
code, run:

```bash
bash demo/tool-expansion-review.sh
```

## Short hooks

- "Your prompt diff can change tool access without looking dramatic."
- "Treat prompt revisions like code review artifacts."
- "A deterministic prompt-risk report beats guessing what changed."
