import { readFile } from 'node:fs/promises';
import { maxSeverity, parseSeverity } from './severity.js';
import type { CheckOptions, CheckResult, Finding, ParsedPrompt, RulesFile } from './types.js';

const defaultRules: RulesFile = {
  forbiddenPhrases: ['ignore previous instructions', 'reveal secrets', 'disable safety'],
  requireSections: [],
};

function makeFinding(id: string, title: string, detail: string, evidence: string[]): Finding {
  return { id, category: 'rules', severity: 'high', title, detail, evidence: evidence.slice(0, 8).sort() };
}

export async function readRules(path?: string): Promise<RulesFile> {
  if (!path) return defaultRules;
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as RulesFile;
  if (parsed.maxSeverity) parseSeverity(parsed.maxSeverity);
  return { ...defaultRules, ...parsed };
}

function includesCaseInsensitive(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle.toLowerCase());
}

export function checkPrompts(prompts: ParsedPrompt[], rules: RulesFile, options: CheckOptions): CheckResult {
  const findings: Finding[] = [];

  for (const prompt of prompts) {
    for (const phrase of rules.requiredPhrases ?? []) {
      if (!includesCaseInsensitive(prompt.normalized, phrase)) {
        findings.push(makeFinding(`required-phrase:${prompt.path}:${phrase}`, 'Required phrase missing', `${prompt.path} does not contain required phrase "${phrase}".`, [phrase]));
      }
    }

    for (const phrase of rules.forbiddenPhrases ?? []) {
      if (includesCaseInsensitive(prompt.normalized, phrase)) {
        findings.push(makeFinding(`forbidden-phrase:${prompt.path}:${phrase}`, 'Forbidden phrase present', `${prompt.path} contains forbidden phrase "${phrase}".`, [phrase]));
      }
    }

    for (const section of rules.requireSections ?? []) {
      const markdownHeading = new RegExp(`^#{1,6}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im');
      if (!markdownHeading.test(prompt.normalized)) {
        findings.push(makeFinding(`required-section:${prompt.path}:${section}`, 'Required section missing', `${prompt.path} does not contain a Markdown section named "${section}".`, [section]));
      }
    }
  }

  const highestSeverity = maxSeverity(findings.map((item) => item.severity));
  return {
    generatedAt: 'deterministic-local',
    files: prompts.map((prompt) => prompt.path).sort(),
    summary: {
      highestSeverity,
      findingCount: findings.length,
      redacted: options.redact,
    },
    findings,
    rules,
  };
}
