import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPrompts, normalizePrompt } from '../dist/index.js';

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
