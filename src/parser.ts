import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import type { ParsedPrompt } from './types.js';
import { redactText } from './redact.js';

const comparisonLines = new WeakMap<ParsedPrompt, string[]>();

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

function normalize(path: string, raw: string): Omit<ParsedPrompt, 'path'> {
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
  return { format, raw, normalized, lines };
}

export function normalizePrompt(path: string, rawInput: string, redact = true): ParsedPrompt {
  const parsed = { path, ...normalize(path, redact ? redactText(rawInput) : rawInput) };
  if (redact) comparisonLines.set(parsed, normalize(path, rawInput).lines);
  return parsed;
}

export function comparisonLinesFor(prompt: ParsedPrompt): string[] {
  return comparisonLines.get(prompt) ?? prompt.lines;
}

export async function readPrompt(path: string, redact = true): Promise<ParsedPrompt> {
  const raw = await readFile(path, 'utf8');
  return normalizePrompt(path, raw, redact);
}
