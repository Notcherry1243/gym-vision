// Extracts a target hold duration from strings like "20s hold" -> 20,
// "30-45s hold" -> 30. Returns null for rep-based exercises like "10-12".
export function parseHoldSeconds(reps: string): number | null {
  if (!/hold|sec/i.test(reps)) return null;
  const match = reps.match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}
