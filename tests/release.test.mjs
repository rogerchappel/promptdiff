import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("release tag must exactly match package version", () => {
  for (const tag of [undefined, "0.1.0", "v0.1", "v9.9.9"]) {
    const args = ["scripts/validate-release-tag.mjs", ...(tag ? [tag] : [])];
    const run = spawnSync(process.execPath, args, { encoding: "utf8", env: { ...process.env, GITHUB_REF_NAME: "" } });
    assert.equal(run.status, 1, tag);
  }
  assert.equal(spawnSync(process.execPath, ["scripts/validate-release-tag.mjs", "v0.1.0"]).status, 0);
});

test("CLI version verification rejects package mismatches", () => {
  const directory = mkdtempSync(join(tmpdir(), "promptdiff-version-check-"));
  const cli = join(directory, "promptdiff");
  const manifest = join(directory, "package.json");
  try {
    writeFileSync(manifest, JSON.stringify({ version: "9.8.7" }));
    writeFileSync(cli, "#!/bin/sh\nprintf '9.8.7\\n'\n");
    chmodSync(cli, 0o755);
    let run = spawnSync(process.execPath, ["scripts/verify-cli-version.mjs", cli, manifest], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);

    writeFileSync(cli, "#!/bin/sh\nprintf '0.1.0\\n'\n");
    run = spawnSync(process.execPath, ["scripts/verify-cli-version.mjs", cli, manifest], { encoding: "utf8" });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /package\.json=9\.8\.7, CLI=0\.1\.0/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("built and installed CLIs report a supplied package version", () => {
  const directory = mkdtempSync(join(tmpdir(), "promptdiff-version-package-"));
  const stage = join(directory, "stage");
  const consumer = join(directory, "consumer");
  try {
    mkdirSync(stage);
    cpSync("dist", join(stage, "dist"), { recursive: true });
    writeFileSync(join(stage, "package.json"), JSON.stringify({
      name: "promptdiff-version-fixture",
      version: "9.8.7",
      type: "module",
      bin: { promptdiff: "./dist/cli.js" },
      files: ["dist"],
    }));

    let run = spawnSync(process.execPath, [join(stage, "dist", "cli.js"), "--version"], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, "9.8.7\n");

    const packed = spawnSync("npm", ["pack", "--silent"], { cwd: stage, encoding: "utf8" });
    assert.equal(packed.status, 0, packed.stderr);
    mkdirSync(consumer);
    assert.equal(spawnSync("npm", ["init", "--yes"], { cwd: consumer, encoding: "utf8" }).status, 0);
    const tarball = join(stage, packed.stdout.trim());
    const install = spawnSync("npm", ["install", tarball], { cwd: consumer, encoding: "utf8" });
    assert.equal(install.status, 0, install.stderr);
    run = spawnSync(join(consumer, "node_modules", ".bin", "promptdiff"), ["--version"], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, "9.8.7\n");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
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

test("CI covers the supported Node.js runtime matrix", () => {
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const engineFloor = Number(packageJson.engines.node.match(/\d+/)?.[0]);
  const matrix = workflow.match(/node-version:\s*\[([^\]]+)\]/)?.[1]
    .split(",")
    .map((version) => Number(version.trim()));

  assert.deepEqual(matrix, [engineFloor, 22, 24]);
  assert.match(workflow, /fail-fast:\s*false/);
  assert.match(workflow, /name:\s*Repository hygiene \(Node \$\{\{ matrix\.node-version \}\}\)/);
  assert.match(workflow, /uses:\s*actions\/setup-node@v\d+/);
  assert.match(workflow, /node-version:\s*\$\{\{ matrix\.node-version \}\}/);
  assert.match(workflow, /cache:\s*npm/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(workflow, /run:\s*npm run release:check/);
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
