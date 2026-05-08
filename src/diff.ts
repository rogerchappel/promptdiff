export interface LineDiff {
  added: string[];
  removed: string[];
}

function countLines(lines: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const key = line.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function expandDelta(source: Map<string, number>, other: Map<string, number>): string[] {
  const output: string[] = [];
  for (const [line, count] of [...source.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const delta = count - (other.get(line) ?? 0);
    for (let i = 0; i < delta; i += 1) output.push(line);
  }
  return output;
}

export function diffLines(oldLines: string[], newLines: string[]): LineDiff {
  const oldCounts = countLines(oldLines);
  const newCounts = countLines(newLines);
  return {
    added: expandDelta(newCounts, oldCounts),
    removed: expandDelta(oldCounts, newCounts),
  };
}
