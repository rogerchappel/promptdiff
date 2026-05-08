const secretPatterns: RegExp[] = [
  /\b(sk-[A-Za-z0-9_-]{12,})\b/g,
  /\b(gh[pousr]_[A-Za-z0-9_]{20,})\b/g,
  /\b(AKIA[0-9A-Z]{16})\b/g,
  /\b(xox[baprs]-[A-Za-z0-9-]{10,})\b/g,
  /\b([A-Za-z0-9._%+-]+:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+)\b/g,
  /\b(api[_-]?key|token|secret|password)\s*[:=]\s*['\"]?([^'\"\s]{8,})['\"]?/gi,
];

export function redactText(input: string): string {
  return secretPatterns.reduce((text, pattern) => text.replace(pattern, (_match, prefix) => {
    if (String(prefix).match(/api|token|secret|password/i)) return `${prefix}=<redacted>`;
    return '<redacted>';
  }), input);
}
