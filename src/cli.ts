#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
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

const packageVersion = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string };

const ignoredGlobDirectories = new Set(['.git', 'dist', 'node_modules']);

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];
  const valueOptions = new Set(['format', 'out', 'fail-on', ...(command === 'check' ? ['rules'] : [])]);
  const booleanOptions = new Set(['no-redact']);
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const [key, inline] = arg.slice(2).split('=', 2);
      if (!valueOptions.has(key) && !booleanOptions.has(key)) throw new Error(`Unknown option: --${key}`);
      if (booleanOptions.has(key)) {
        if (inline !== undefined) throw new Error(`Option --${key} does not take a value.`);
        flags.set('redact', false);
      } else if (inline !== undefined && inline !== '') {
        flags.set(key, inline);
      } else if (inline === undefined && rest[i + 1] && !rest[i + 1].startsWith('--')) {
        flags.set(key, rest[++i]);
      } else {
        throw new Error(`Option --${key} requires a value.`);
      }
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

function globRegex(pattern: string): RegExp {
  const normalized = pattern.split(sep).join('/');
  let source = '';
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    if (char === '*' && normalized[index + 1] === '*') {
      index += 1;
      if (normalized[index + 1] === '/') {
        index += 1;
        source += '(?:.*/)?';
      } else {
        source += '.*';
      }
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${source}$`);
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)) {
    const path = join(root, entry.name);
    if (entry.isDirectory() && !ignoredGlobDirectories.has(entry.name)) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function expandInputs(inputs: string[]): Promise<string[]> {
  const expanded: string[] = [];
  for (const input of inputs) {
    if (!/[*?]/.test(input)) {
      try {
        if (!(await stat(input)).isFile()) throw new Error();
      } catch {
        throw new Error(`check input did not match any files: ${input}`);
      }
      expanded.push(isAbsolute(input) ? input : relative(process.cwd(), resolve(input)));
      continue;
    }
    const firstMagic = input.search(/[*?]/);
    const slash = Math.max(input.lastIndexOf('/', firstMagic), input.lastIndexOf(sep, firstMagic));
    const root = resolve(slash === -1 ? '.' : input.slice(0, slash) || sep);
    let candidates: string[] = [];
    try {
      candidates = await listFiles(root);
    } catch {
      // A missing static prefix is an unmatched pattern, handled below.
    }
    const regex = globRegex(resolve(input));
    const matches = candidates
      .filter((file) => regex.test(file.split(sep).join('/')))
      .map((file) => isAbsolute(input) ? file : relative(process.cwd(), file))
      .sort();
    if (matches.length === 0) throw new Error(`check input did not match any files: ${input}`);
    expanded.push(...matches);
  }
  return [...new Set(expanded)].sort();
}

async function runCompare(args: ParsedArgs): Promise<number> {
  const [oldPath, newPath] = args.positionals;
  if (!oldPath || !newPath || args.positionals.length !== 2) throw new Error('compare requires exactly <old> and <new>.');
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
  if (files.length === 0) throw new Error('check did not match any files.');
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
  if (!args.command || args.command === '--help' || args.command === '-h' || args.command === '--examples') {
    process.stdout.write(help());
    return 0;
  }
  if (args.command === '--version' || args.command === '-v') {
    process.stdout.write(`${packageVersion.version}\n`);
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
