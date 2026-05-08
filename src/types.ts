export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type Category =
  | 'instruction'
  | 'tool'
  | 'output-contract'
  | 'secret'
  | 'rules'
  | 'content';

export interface Finding {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  detail: string;
  evidence: string[];
}

export interface ParsedPrompt {
  path: string;
  format: 'json' | 'jsonl' | 'markdown' | 'text';
  raw: string;
  normalized: string;
  lines: string[];
}

export interface CompareOptions {
  redact: boolean;
  failOn?: Severity;
}

export interface CompareResult {
  oldPath: string;
  newPath: string;
  generatedAt: string;
  summary: {
    highestSeverity: Severity;
    findingCount: number;
    changedLineCount: number;
    addedLineCount: number;
    removedLineCount: number;
    redacted: boolean;
  };
  findings: Finding[];
  diff: {
    added: string[];
    removed: string[];
  };
}

export interface RulesFile {
  requiredPhrases?: string[];
  forbiddenPhrases?: string[];
  requireSections?: string[];
  maxSeverity?: Severity;
}

export interface CheckOptions {
  redact: boolean;
  rulesPath?: string;
  failOn?: Severity;
}

export interface CheckResult {
  generatedAt: string;
  files: string[];
  summary: {
    highestSeverity: Severity;
    findingCount: number;
    redacted: boolean;
  };
  findings: Finding[];
  rules: RulesFile;
}
