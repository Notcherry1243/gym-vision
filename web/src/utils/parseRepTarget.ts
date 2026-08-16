// Extracts a target rep count from strings like "10-12" -> 10, "8" -> 8.
// Returns null for timed exercises like "20s hold" or "30-45s hold", since
// camera rep counting only makes sense for discrete reps.
export function parseRepTarget(reps: string): number | null {
  if (/s\s*hold|hold|sec/i.test(reps)) return null;
  const match = reps.match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}
