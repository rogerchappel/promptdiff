# Review Role Boundary Drift

This walkthrough shows how PromptDiff catches a prompt changing from a narrow
release-note assistant into a broader launch assistant with tool access and a
different output contract.

## Run it

```sh
npm install
bash demo/review-role-boundary-drift.sh
```

The script compares:

- `examples/prompts/role-boundary-old.md`
- `examples/prompts/role-boundary-new.md`

Reports are written under `${TMPDIR:-/tmp}/promptdiff-role-boundary`.

## What to review

- The new prompt adds browser and shell tool language.
- The old prompt required JSON; the new prompt asks for Markdown.
- The old prompt protected against unsupported usage or adoption claims.
- The report stays local and deterministic, so it can be attached to a PR.

Use this demo when explaining why prompt reviews need more than a visual text
diff. The risky part is not just that words changed; it is that role, tool
surface, and parser contract changed together.
