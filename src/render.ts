import type { CheckResult, CompareResult, Finding } from './types.js';

function jsonStable(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as object).sort(), 2);
}

function renderFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'No findings.';
  return findings.map((finding) => {
    const evidence = finding.evidence.length
      ? finding.evidence.map((line) => `  - \`${line.replace(/`/g, '\\`')}\``).join('\n')
      : '  - No evidence captured.';
    return `### ${finding.severity.toUpperCase()} · ${finding.title}\n\n- id: \`${finding.id}\`\n- category: \`${finding.category}\`\n- detail: ${finding.detail}\n- evidence:\n${evidence}`;
  }).join('\n\n');
}

export function renderCompareMarkdown(result: CompareResult): string {
  return `# PromptDiff Compare Report\n\n## Summary\n\n- old: \`${result.oldPath}\`\n- new: \`${result.newPath}\`\n- highest severity: **${result.summary.highestSeverity}**\n- findings: **${result.summary.findingCount}**\n- changed lines: **${result.summary.changedLineCount}** (${result.summary.addedLineCount} added, ${result.summary.removedLineCount} removed)\n- redaction: **${result.summary.redacted ? 'enabled' : 'disabled'}**\n\n## Findings\n\n${renderFindings(result.findings)}\n\n## Deterministic line diff\n\n### Added\n\n${result.diff.added.map((line) => `- ${line}`).join('\n') || 'No added lines.'}\n\n### Removed\n\n${result.diff.removed.map((line) => `- ${line}`).join('\n') || 'No removed lines.'}\n`;
}

export function renderCheckMarkdown(result: CheckResult): string {
  return `# PromptDiff Rules Check\n\n## Summary\n\n- files: **${result.files.length}**\n- highest severity: **${result.summary.highestSeverity}**\n- findings: **${result.summary.findingCount}**\n- redaction: **${result.summary.redacted ? 'enabled' : 'disabled'}**\n\n## Files\n\n${result.files.map((file) => `- \`${file}\``).join('\n')}\n\n## Findings\n\n${renderFindings(result.findings)}\n`;
}

export function renderJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
