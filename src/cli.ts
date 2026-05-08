#!/usr/bin/env node
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { analyzePromptDiff } from './analyzer.js';
import { readPrompt } from './parser.js';
import { renderCheckMarkdown, renderCompareMarkdown, renderJson } from './render.js';
import { checkPrompts, readRules } from './rules.js';
import { meetsThreshold, parseSeverity } from './severity.js';

type Format = 'markdown' | 'json';

interface ParsedArgs {
  command?: string;
  positionals: string[];
  flags: Map<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const [key, inline] = arg.slice(2).split('=', 2);
      if (key === 'no-redact') flags.set('redact', false);
      else if (inline !== undefined) flags.set(key, inline);
      else if (rest[i + 1] && !rest[i + 1].startsWith('--')) flags.set(key, rest[++i]);
      else flags.set(key, true);
    } else {
      positionals.push(arg);
    }
  }
  return { command, positionals, flags };
}

function help(): string {
  return `PromptDiff — local-first prompt revision risk reports\n\nUsage:\n  promptdiff compare <old> <new> [--format markdown|json] [--out file] [--fail-on high] [--no-redact]\n  promptdiff check <files...> [--rules rules.json] [--format markdown|json] [--out file] [--fail-on high] [--no-redact]\n  promptdiff examples\n\nExamples:\n  promptdiff compare examples/prompts/v1.md examples/prompts/v2.md --out prompt-risk.md\n  promptdiff compare examples/prompts/v1.md examples/prompts/v2.md --format json\n  promptdiff check examples/prompts/*.md --rules examples/rules.json --fail-on high\n`;
}

function flagString(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  if (typeof value === 'boolean') return value ? 'true' : undefined;
  return value;
}

function flagFormat(flags: Map<string, string | boolean>): Format {
  const value = flagString(flags, 'format') ?? 'markdown';
  if (value !== 'markdown' && value !== 'json') throw new Error('Format must be markdown or json.');
  return value;
}

async function writeOrPrint(content: string, out?: string): Promise<void> {
  if (!out) {
    process.stdout.write(content);
    return;
  }
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, content, 'utf8');
}

async function expandInputs(inputs: string[]): Promise<string[]> {
  const expanded: string[] = [];
  for (const input of inputs) {
    if (!input.includes('*')) {
      expanded.push(input);
      continue;
    }
    const dir = dirname(input);
    const pattern = input.slice(dir.length + 1).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    const entries = await readdir(dir === '.' ? process.cwd() : dir);
    expanded.push(...entries.filter((entry) => regex.test(entry)).map((entry) => join(dir, entry)).sort());
  }
  return [...new Set(expanded)].sort();
}

async function runCompare(args: ParsedArgs): Promise<number> {
  const [oldPath, newPath] = args.positionals;
  if (!oldPath || !newPath) throw new Error('compare requires <old> and <new>.');
  const redact = args.flags.get('redact') !== false;
  const [oldPrompt, newPrompt] = await Promise.all([readPrompt(oldPath, redact), readPrompt(newPath, redact)]);
  const failOn = parseSeverity(flagString(args.flags, 'fail-on'));
  const result = analyzePromptDiff(oldPrompt, newPrompt, { redact, failOn });
  const content = flagFormat(args.flags) === 'json' ? renderJson(result) : renderCompareMarkdown(result);
  await writeOrPrint(content, flagString(args.flags, 'out'));
  return meetsThreshold(result.summary.highestSeverity, failOn) ? 2 : 0;
}

async function runCheck(args: ParsedArgs): Promise<number> {
  if (args.positionals.length === 0) throw new Error('check requires at least one file.');
  const redact = args.flags.get('redact') !== false;
  const files = await expandInputs(args.positionals);
  const prompts = await Promise.all(files.map((file) => readPrompt(file, redact)));
  const rules = await readRules(flagString(args.flags, 'rules'));
  const failOn = parseSeverity(flagString(args.flags, 'fail-on'), rules.maxSeverity);
  const result = checkPrompts(prompts, rules, { redact, rulesPath: flagString(args.flags, 'rules'), failOn });
  const content = flagFormat(args.flags) === 'json' ? renderJson(result) : renderCheckMarkdown(result);
  await writeOrPrint(content, flagString(args.flags, 'out'));
  return meetsThreshold(result.summary.highestSeverity, failOn) ? 2 : 0;
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const args = parseArgs(argv);
  if (!args.command || args.command === '--help' || args.command === '-h') {
    process.stdout.write(help());
    return 0;
  }
  if (args.command === '--version' || args.command === '-v') {
    process.stdout.write('0.1.0\n');
    return 0;
  }
  if (args.command === 'examples') {
    process.stdout.write(help());
    return 0;
  }
  if (args.command === 'compare') return runCompare(args);
  if (args.command === 'check') return runCheck(args);
  throw new Error(`Unknown command: ${args.command}`);
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  process.stderr.write(`promptdiff: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
