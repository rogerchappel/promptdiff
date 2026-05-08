import type { Severity } from './types.js';

export const severityRank: Record<Severity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function maxSeverity(values: Severity[]): Severity {
  return values.reduce<Severity>((max, next) =>
    severityRank[next] > severityRank[max] ? next : max,
  'info');
}

export function meetsThreshold(actual: Severity, threshold?: Severity): boolean {
  return threshold ? severityRank[actual] >= severityRank[threshold] : false;
}

export function parseSeverity(value: string | undefined, fallback?: Severity): Severity | undefined {
  if (!value) return fallback;
  if (['info', 'low', 'medium', 'high', 'critical'].includes(value)) return value as Severity;
  throw new Error(`Unknown severity "${value}". Use info, low, medium, high, or critical.`);
}
