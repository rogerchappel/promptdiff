#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const verifyCliVersion = fileURLToPath(new URL("./verify-cli-version.mjs", import.meta.url));

const requiredFiles = [
  "dist/cli.js",
  "dist/index.js",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const [pack] = JSON.parse(output);
const packedFiles = new Set(pack.files.map((file) => file.path));
const missing = requiredFiles.filter((file) => !packedFiles.has(file));

if (missing.length > 0) {
  console.error(`Package smoke failed; missing ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Package smoke passed with ${pack.files.length} files.`);

execFileSync(process.execPath, [verifyCliVersion, join(process.cwd(), "dist", "cli.js")], {
  stdio: "inherit",
});

const consumer = mkdtempSync(join(tmpdir(), "promptdiff-package-smoke-"));
try {
  const tarball = execFileSync("npm", ["pack", "--silent"], { encoding: "utf8" }).trim();
  execFileSync("npm", ["init", "--yes"], { cwd: consumer, stdio: "ignore" });
  execFileSync("npm", ["install", join(process.cwd(), tarball)], { cwd: consumer, stdio: "inherit" });
  const cli = join(consumer, "node_modules", ".bin", "promptdiff");
  const help = execFileSync(cli, ["--help"], { cwd: consumer, encoding: "utf8" });
  if (!help.includes("promptdiff compare")) throw new Error("Installed CLI help was not usable");
  execFileSync(process.execPath, [verifyCliVersion, cli, join(process.cwd(), "package.json")], {
    cwd: consumer,
    stdio: "inherit",
  });
  rmSync(join(process.cwd(), tarball));
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
