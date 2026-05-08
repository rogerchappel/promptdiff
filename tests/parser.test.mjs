import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrompt, redactText } from '../dist/index.js';

test('normalizes json deterministically', () => {
  const parsed = normalizePrompt('fixture.json', '{"b":2,"a":1}', true);
  assert.equal(parsed.format, 'json');
  assert.equal(parsed.normalized, '{"a":1,"b":2}');
});

test('redacts common token shapes', () => {
  assert.equal(redactText('token=supersecretvalue'), 'token=<redacted>');
  assert.equal(redactText('sk-1234567890abcdef'), '<redacted>');
});
