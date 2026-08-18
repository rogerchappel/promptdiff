import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

test("release tag must exactly match package version", () => {
  for (const tag of [undefined, "0.1.0", "v0.1", "v9.9.9"]) {
    const args = ["scripts/validate-release-tag.mjs", ...(tag ? [tag] : [])];
    const run = spawnSync(process.execPath, args, { encoding: "utf8", env: { ...process.env, GITHUB_REF_NAME: "" } });
    assert.equal(run.status, 1, tag);
  }
  assert.equal(spawnSync(process.execPath, ["scripts/validate-release-tag.mjs", "v0.1.0"]).status, 0);
});

test("release workflow validates before publishing and publishes before GitHub release", () => {
  const workflow = readFileSync(".github/workflows/release.yml", "utf8");
  const validate = workflow.indexOf("npm run release:tag");
  const publish = workflow.indexOf("npm publish --provenance --access public");
  const githubRelease = workflow.indexOf("gh release create");
  assert.ok(validate >= 0 && validate < publish);
  assert.ok(publish < githubRelease);
  assert.match(workflow, /permissions:\n  contents: write\n  id-token: write/);
});

test("dry run validates a prospective package tag", () => {
  const workflow = readFileSync(".github/workflows/release-dry-run.yml", "utf8");
  const step = workflow.match(/- name: Validate prospective release tag\n {8}run: \|\n((?: {10}.*\n)+)/);
  assert.ok(step, "prospective release tag step must use a shell block");

  const command = step[1]
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(10))
    .join("\n");
  const run = spawnSync("bash", ["-euo", "pipefail", "-c", command], { encoding: "utf8" });

  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /Release tag v0\.1\.0 matches package version 0\.1\.0\./);
  assert.ok(workflow.indexOf("Validate prospective release tag") < workflow.indexOf("Run release checks"));
});
