#!/usr/bin/env node
import { readFileSync } from "node:fs";

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;
const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const expected = `v${version}`;

if (!tag || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag) || tag !== expected) {
  console.error(`Release tag must exactly match package version: expected ${expected}, received ${tag ?? "<missing>"}.`);
  process.exit(1);
}

console.log(`Release tag ${tag} matches package version ${version}.`);
