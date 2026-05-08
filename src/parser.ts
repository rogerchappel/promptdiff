import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import type { ParsedPrompt } from './types.js';
import { redactText } from './redact.js';

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${JSON.stringify(key)}:${stableJson(val)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function detectFormat(path: string, raw: string): ParsedPrompt['format'] {
  const ext = extname(path).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.jsonl' || ext === '.ndjson') return 'jsonl';
  if (ext === '.md' || ext === '.markdown') return 'markdown';
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  return 'text';
}

export function normalizePrompt(path: string, rawInput: string, redact = true): ParsedPrompt {
  const raw = redact ? redactText(rawInput) : rawInput;
  const format = detectFormat(path, raw);
  let normalized = raw.replace(/\r\n/g, '\n').trim();

  if (format === 'json') {
    normalized = stableJson(JSON.parse(raw));
  }

  if (format === 'jsonl') {
    normalized = raw
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => stableJson(JSON.parse(line)))
      .join('\n');
  }

  const lines = normalized.split('\n').map((line) => line.trimEnd());
  return { path, format, raw, normalized, lines };
}

export async function readPrompt(path: string, redact = true): Promise<ParsedPrompt> {
  const raw = await readFile(path, 'utf8');
  return normalizePrompt(path, raw, redact);
}
