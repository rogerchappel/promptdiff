#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [cli, manifest = "package.json"] = process.argv.slice(2);
if (!cli) {
  console.error("Usage: verify-cli-version <cli> [package.json]");
  process.exit(1);
}

const expected = JSON.parse(readFileSync(manifest, "utf8")).version;
const command = cli.endsWith(".js") ? process.execPath : cli;
const args = cli.endsWith(".js") ? [cli, "--version"] : ["--version"];
const actual = execFileSync(command, args, { encoding: "utf8" }).trim();

if (actual !== expected) {
  console.error(`CLI version mismatch: package.json=${expected}, CLI=${actual}`);
  process.exit(1);
}

console.log(`CLI version ${actual} matches package.json.`);
