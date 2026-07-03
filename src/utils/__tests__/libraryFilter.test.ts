import { scoreMatch } from "utils/libraryFilter";

describe("scoreMatch", () => {
  it("returns score 0 and no indices for an empty query", () => {
    expect(scoreMatch("", "Illinois State Library")).toEqual({
      score: 0,
      matchIndices: []
    });
  });

  it("returns score 100 and full indices for an exact match", () => {
    expect(scoreMatch("illinois", "Illinois")).toEqual({
      score: 100,
      matchIndices: [0, 1, 2, 3, 4, 5, 6, 7]
    });
  });

  it("returns score 80 and leading indices when target starts with query", () => {
    expect(scoreMatch("ill", "Illinois State Library")).toEqual({
      score: 80,
      matchIndices: [0, 1, 2]
    });
  });

  it("returns score 60 and indices at the matching word when a word starts with query", () => {
    // "Illinois" starts at index 14 in "Northern Illinois University"
    //  N o r t h e r n   I  l  l  i  n  o  i  s
    //  0 1 2 3 4 5 6 7 8 9 10 11 ...
    const { score, matchIndices } = scoreMatch(
      "ill",
      "Northern Illinois University"
    );
    expect(score).toBe(60);
    expect(matchIndices).toEqual([9, 10, 11]);
  });

  it("anchors indices to the matching word, not an earlier fuzzy opportunity", () => {
    // "RAILS" contains 'i' and 'l' before "Illinois", but the word match wins.
    const { score, matchIndices } = scoreMatch(
      "ill",
      "RAILS eRead Illinois Library"
    );
    expect(score).toBe(60);
    // "Illinois" starts at index 12 in the lowercased string
    expect(matchIndices).toEqual([12, 13, 14]);
  });

  it("returns score 40 and substring indices when query appears as a substring", () => {
    // "ill" appears inside "Millbrook" at index 1
    expect(scoreMatch("ill", "Millbrook Library")).toEqual({
      score: 40,
      matchIndices: [1, 2, 3]
    });
  });

  it("returns score 20 and fuzzy indices for a non-contiguous match", () => {
    // "ill" in "Tidal Library": i→1, l→4, l→6 (T-i-d-a-l- -L-i...)
    const { score, matchIndices } = scoreMatch("ill", "Tidal Library");
    expect(score).toBe(20);
    expect(matchIndices).toEqual([1, 4, 6]);
  });

  it("returns score 0 and no indices when there is no match", () => {
    expect(scoreMatch("zzz", "Alpha Library")).toEqual({
      score: 0,
      matchIndices: []
    });
  });
});
