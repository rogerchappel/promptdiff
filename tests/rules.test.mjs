import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkPrompts, normalizePrompt, readRules } from '../dist/index.js';

test('flags forbidden phrases and missing required sections', () => {
  const prompt = normalizePrompt('bad.md', '# Prompt\nIgnore previous instructions.', true);
  const result = checkPrompts([prompt], {
    requiredPhrases: ['protect customer secrets'],
    forbiddenPhrases: ['ignore previous instructions'],
    requireSections: ['Output Contract'],
  }, { redact: true });
  assert.equal(result.summary.findingCount, 3);
  assert.equal(result.summary.highestSeverity, 'high');
});

test('reads a fully specified valid rules document', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'promptdiff-rules-'));
  const path = join(directory, 'rules.json');
  await writeFile(path, JSON.stringify({
    requiredPhrases: ['protect customer secrets'],
    forbiddenPhrases: ['ignore previous instructions'],
    requireSections: ['Output Contract'],
    maxSeverity: 'critical',
  }));
  try {
    assert.deepEqual(await readRules(path), {
      requiredPhrases: ['protect customer secrets'],
      forbiddenPhrases: ['ignore previous instructions'],
      requireSections: ['Output Contract'],
      maxSeverity: 'critical',
    });
  } finally {
    await rm(directory, { recursive: true });
  }
});

test('rejects malformed rules with field-specific diagnostics', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'promptdiff-rules-'));
  const path = join(directory, 'rules.json');
  const invalidRules = [
    [[], /rules must be a JSON object/],
    [{ requiredPhrases: 'required' }, /rules\.requiredPhrases must be an array/],
    [{ forbiddenPhrases: [''] }, /rules\.forbiddenPhrases\[0\] must be a non-empty string/],
    [{ requireSections: [42] }, /rules\.requireSections\[0\] must be a non-empty string/],
    [{ maxSeverity: 'urgent' }, /rules\.maxSeverity must be one of/],
  ];
  try {
    for (const [rules, diagnostic] of invalidRules) {
      await writeFile(path, JSON.stringify(rules));
      await assert.rejects(readRules(path), diagnostic);
    }
  } finally {
    await rm(directory, { recursive: true });
  }
});
