import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('cli compare returns gate failure when fail-on threshold is met', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'compare', 'examples/prompts/v1.md', 'examples/prompts/v2.md', '--fail-on', 'high'], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.match(run.stdout, /Dangerous instruction added/);
});

test('cli reports secret-only changes in redacted Markdown and JSON', () => {
  const directory = mkdtempSync(join(tmpdir(), 'promptdiff-cli-secrets-'));
  const oldPath = join(directory, 'old.md');
  const newPath = join(directory, 'new.md');
  writeFileSync(oldPath, 'token=aaaaaaaa\n');
  writeFileSync(newPath, 'token=bbbbbbbb\n');

  try {
    for (const format of ['markdown', 'json']) {
      const run = spawnSync(process.execPath, [
        'dist/cli.js', 'compare', oldPath, newPath, '--format', format,
      ], { encoding: 'utf8' });
      assert.equal(run.status, 0);
      assert.match(run.stdout, /<redacted>/);
      assert.doesNotMatch(run.stdout, /aaaaaaaa|bbbbbbbb/);
      assert.equal(run.stderr, '');
    }
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('cli check passes safe fixture rules', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'check', 'examples/prompts/safe.md', '--rules', 'examples/rules.json'], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /PromptDiff Rules Check/);
});

test('cli examples flag prints copy-paste commands', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', '--examples'], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /promptdiff compare/);
  assert.match(run.stdout, /promptdiff check/);
});

test('cli check explains unmatched globs', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'check', 'examples/prompts/none-*.md'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /did not match any files/);
});

test('cli rejects unknown options', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'compare', 'examples/prompts/v1.md', 'examples/prompts/v2.md', '--bogus'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, '');
  assert.match(run.stderr, /Unknown option: --bogus/);
});

test('cli rejects options without values', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'check', 'examples/prompts/safe.md', '--rules'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, '');
  assert.match(run.stderr, /Option --rules requires a value/);
});

test('cli compare rejects extra positional arguments', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'compare', 'examples/prompts/v1.md', 'examples/prompts/v2.md', 'extra.md'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, '');
  assert.match(run.stderr, /compare requires exactly <old> and <new>/);
});

test('cli check rejects a mixed matched and unmatched input set', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'check', 'examples/prompts/safe.md', 'examples/prompts/missing-*.md', '--rules', 'examples/rules.json'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, '');
  assert.match(run.stderr, /input did not match any files: examples\/prompts\/missing-\*\.md/);
});

test('cli check expands recursive globs into sorted unique files', () => {
  const run = spawnSync(process.execPath, [
    'dist/cli.js', 'check', 'examples/**/*.md', './examples/prompts/safe.md',
    '--format', 'json',
  ], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.equal(run.stderr, '');
  const report = JSON.parse(run.stdout);
  assert.deepEqual(report.files, [...new Set(report.files)].sort());
  assert.ok(report.files.includes('examples/README.md'));
  assert.ok(report.files.includes('examples/prompts/safe.md'));
});

test('cli rejects malformed rules without emitting a report', () => {
  const directory = mkdtempSync(join(tmpdir(), 'promptdiff-cli-rules-'));
  const rulesPath = join(directory, 'rules.json');
  writeFileSync(rulesPath, JSON.stringify({ requireSections: [42] }));
  try {
    const run = spawnSync(process.execPath, [
      'dist/cli.js', 'check', 'examples/prompts/safe.md', '--rules', rulesPath,
    ], { encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.equal(run.stdout, '');
    assert.match(run.stderr, /rules\.requireSections\[0\] must be a non-empty string/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('cli accepts documented compare option forms', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'compare', 'examples/prompts/v1.md', 'examples/prompts/v2.md', '--format', 'json', '--fail-on', 'high', '--no-redact'], { encoding: 'utf8' });
  assert.equal(run.status, 2);
  assert.doesNotThrow(() => JSON.parse(run.stdout));
  assert.equal(run.stderr, '');
});

test('cli accepts documented check option forms', () => {
  const run = spawnSync(process.execPath, ['dist/cli.js', 'check', 'examples/prompts/safe.md', '--rules', 'examples/rules.json', '--format=markdown', '--fail-on=high', '--no-redact'], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /PromptDiff Rules Check/);
  assert.equal(run.stderr, '');
});
