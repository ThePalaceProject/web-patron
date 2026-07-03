export type MatchResult = { score: number; matchIndices: number[] };

/**
 * Returns the indices of matched characters in `target` (case-insensitive),
 * or null if not all query characters can be matched in order.
 * An empty query matches everything and returns [].
 */
export function fuzzyMatchIndices(
  query: string,
  target: string
): number[] | null {
  if (!query) return [];
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices: number[] = [];
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      qi++;
    }
  }
  return qi === q.length ? indices : null;
}

/**
 * Scores how well `query` matches `target` and returns the character indices
 * to highlight, anchored to the best match position.
 *
 * Tiers (higher is better):
 *   100 — exact match
 *    80 — target starts with query
 *    60 — any word in target starts with query
 *    40 — target contains query as a substring
 *    20 — fuzzy (all query chars appear in order)
 *     0 — no match
 */
export function scoreMatch(query: string, target: string): MatchResult {
  const noMatch: MatchResult = { score: 0, matchIndices: [] };
  if (!query) return noMatch;

  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const contiguous = (start: number) =>
    Array.from({ length: q.length }, (_, i) => start + i);

  if (t.startsWith(q)) {
    return { score: t === q ? 100 : 80, matchIndices: contiguous(0) };
  }

  let offset = 0;
  while (offset < t.length) {
    while (offset < t.length && /\W/.test(t[offset])) offset++;
    const wordStart = offset;
    while (offset < t.length && /\w/.test(t[offset])) offset++;
    if (offset > wordStart && t.slice(wordStart, offset).startsWith(q)) {
      return { score: 60, matchIndices: contiguous(wordStart) };
    }
  }

  const substringIdx = t.indexOf(q);
  if (substringIdx !== -1) {
    return { score: 40, matchIndices: contiguous(substringIdx) };
  }

  const fuzzyIndices = fuzzyMatchIndices(query, target);
  return fuzzyIndices !== null
    ? { score: 20, matchIndices: fuzzyIndices }
    : noMatch;
}
