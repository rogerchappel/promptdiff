import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('cli compare returns gate failure when fail-on threshold is met', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'compare', 'examples/prompts/v1.md', 'examples/prompts/v2.md', '--fail-on', 'high'], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.match(run.stdout, /Dangerous instruction added/);
});

test('cli check passes safe fixture rules', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'check', 'examples/prompts/safe.md', '--rules', 'examples/rules.json'], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /PromptDiff Rules Check/);
});
