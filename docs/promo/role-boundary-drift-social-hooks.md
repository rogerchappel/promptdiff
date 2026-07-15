# Role Boundary Drift Social Hooks

Grounded source files:

- `examples/prompts/role-boundary-old.md`
- `examples/prompts/role-boundary-new.md`
- `demo/review-role-boundary-drift.sh`
- `docs/tutorials/review-role-boundary-drift.md`

## Short hooks

- "Prompt diffs are not just text diffs. Role, tools, and output contracts can all drift in one edit."
- "This demo turns a release-note assistant into a launch assistant and shows exactly what changed."
- "If your parser expects JSON, a prompt edit that switches to Markdown is a production change."

## Demo angle

Run `bash demo/review-role-boundary-drift.sh`, open the Markdown report, and
show the tool-surface and output-contract findings before showing the raw prompt
diff.

## Limitations to say out loud

- PromptDiff is deterministic and heuristic.
- It does not judge whether the new prompt is better.
- Reviewers still decide whether the changed role boundary is acceptable.
