import { diffLines } from './diff.js';
import { comparisonLinesFor } from './parser.js';
import { redactText } from './redact.js';
import { maxSeverity } from './severity.js';
import type { CompareOptions, CompareResult, Finding, ParsedPrompt, Severity } from './types.js';

const instructionWords = /\b(system|developer|must|never|always|do not|don't|refuse|ignore|bypass|override|jailbreak|policy|safety|instruction)\b/i;
const dangerousInstructionWords = /\b(ignore|bypass|override|jailbreak|reveal|exfiltrate|disable safety|do anything|without restriction)\b/i;
const safetyWords = /\b(refuse|do not|don't|never|safety|policy|secret|credentials|private|sensitive)\b/i;
const toolWords = /\b(tool|function|shell|bash|exec|browser|http|network|curl|wget|write_file|delete|rm -rf|database|sql|email|slack)\b/i;
const outputWords = /\b(json|schema|xml|markdown|yaml|csv|format|output contract|respond with|return only|valid)\b/i;

function finding(id: string, category: Finding['category'], severity: Severity, title: string, detail: string, evidence: string[]): Finding {
  return { id, category, severity, title, detail, evidence: evidence.slice(0, 8).sort() };
}

function select(lines: string[], pattern: RegExp): string[] {
  return lines.filter((line) => pattern.test(line));
}

function removedSafety(removed: string[]): string[] {
  return removed.filter((line) => safetyWords.test(line));
}

export function analyzePromptDiff(oldPrompt: ParsedPrompt, newPrompt: ParsedPrompt, options: CompareOptions): CompareResult {
  const comparisonDiff = diffLines(comparisonLinesFor(oldPrompt), comparisonLinesFor(newPrompt));
  const diff = options.redact
    ? {
        added: comparisonDiff.added.map(redactText),
        removed: comparisonDiff.removed.map(redactText),
      }
    : comparisonDiff;
  const findings: Finding[] = [];

  const addedInstructions = select(diff.added, instructionWords);
  const removedInstructions = select(diff.removed, instructionWords);
  const addedDangerous = select(diff.added, dangerousInstructionWords);
  const removedSafetyLines = removedSafety(diff.removed);
  const addedTools = select(diff.added, toolWords);
  const removedTools = select(diff.removed, toolWords);
  const outputChanges = [...select(diff.added, outputWords), ...select(diff.removed, outputWords)];
  const secretEvidence = [...diff.added, ...diff.removed].filter((line) => line.includes('<redacted>'));

  if (addedDangerous.length > 0) {
    findings.push(finding('instruction-dangerous-added', 'instruction', 'critical', 'Dangerous instruction added', 'New prompt text appears to weaken hierarchy, bypass safety, reveal secrets, or override restrictions.', addedDangerous));
  }

  if (removedSafetyLines.length > 0) {
    findings.push(finding('instruction-safety-removed', 'instruction', 'high', 'Safety instruction removed', 'A removed line referenced refusal, secrets, policy, or other safety guardrails.', removedSafetyLines));
  }

  if (addedInstructions.length + removedInstructions.length > 0) {
    findings.push(finding('instruction-changed', 'instruction', addedDangerous.length || removedSafetyLines.length ? 'high' : 'medium', 'Instruction language changed', 'Instruction-like text was added or removed and should be reviewed as behavior-changing prompt code.', [...addedInstructions, ...removedInstructions]));
  }

  if (addedTools.length > 0 || removedTools.length > 0) {
    findings.push(finding('tool-surface-changed', 'tool', addedTools.length > 0 ? 'high' : 'medium', 'Tool surface changed', 'Tool, network, shell, write, delete, or database capabilities were added or removed.', [...addedTools, ...removedTools]));
  }

  if (outputChanges.length > 0) {
    findings.push(finding('output-contract-changed', 'output-contract', 'medium', 'Output contract changed', 'Format/schema/return-only language changed, which can break parsers or downstream checks.', outputChanges));
  }

  if (secretEvidence.length > 0) {
    findings.push(finding('secret-redacted', 'secret', 'high', 'Secret-like value redacted', 'PromptDiff redacted token/key-shaped text before rendering output.', secretEvidence));
  }

  if (findings.length === 0 && (diff.added.length > 0 || diff.removed.length > 0)) {
    findings.push(finding('content-changed', 'content', 'low', 'Content changed', 'Prompt text changed without matching the higher-risk instruction/tool/output-contract heuristics.', [...diff.added, ...diff.removed]));
  }

  const highestSeverity = maxSeverity(findings.map((item) => item.severity));
  return {
    oldPath: oldPrompt.path,
    newPath: newPrompt.path,
    generatedAt: 'deterministic-local',
    summary: {
      highestSeverity,
      findingCount: findings.length,
      changedLineCount: diff.added.length + diff.removed.length,
      addedLineCount: diff.added.length,
      removedLineCount: diff.removed.length,
      redacted: options.redact,
    },
    findings,
    diff,
  };
}
