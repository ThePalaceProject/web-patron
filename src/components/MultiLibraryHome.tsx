/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import useSWR from "swr";
import { useAppConfig } from "components/context/AppConfigContext";
import theme from "theme/theme";
import LibraryHomeLink from "./LibraryHomeLink";
import TextInput from "components/TextInput";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";

const FILTER_DEBOUNCE_MS = 200;
const RESULTS_LIST_ID = "library-filter-results";

async function fetchLibraries(url: string): Promise<LibrariesResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch libraries");
  return res.json();
}

/**
 * Returns the indices of matched characters in `target` (case-insensitive),
 * or null if not all query characters can be matched in order.
 * An empty query matches everything and returns [].
 */
function fuzzyMatchIndices(query: string, target: string): number[] | null {
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

export type MatchResult = { score: number; matchIndices: number[] };

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

/** Renders `text` with matched characters wrapped in <mark> for search highlighting. */
const HighlightedText: React.FC<{ text: string; matchIndices: number[] }> = ({
  text,
  matchIndices
}) => {
  if (matchIndices.length === 0) return <>{text}</>;
  const set = new Set(matchIndices);
  const runs: Array<[string, boolean]> = [];
  for (let i = 0; i < text.length; ) {
    const hl = set.has(i);
    let j = i + 1;
    while (j < text.length && set.has(j) === hl) j++;
    runs.push([text.slice(i, j), hl]);
    i = j;
  }
  return (
    <>
      {runs.map(([chunk, hl], idx) =>
        hl ? (
          <mark key={idx} sx={{ bg: "transparent", fontWeight: "bold" }}>
            {chunk}
          </mark>
        ) : (
          <React.Fragment key={idx}>{chunk}</React.Fragment>
        )
      )}
    </>
  );
};

const MultiLibraryHome: React.FC = () => {
  const { instanceName } = useAppConfig();
  const { data, error } = useSWR<LibrariesResponse>(
    "/api/libraries",
    fetchLibraries
  );

  const [inputValue, setInputValue] = React.useState("");
  const [filterQuery, setFilterQuery] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(
      () => setFilterQuery(inputValue),
      FILTER_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [inputValue]);

  if (error)
    return <p>Unable to load static libraries from configuration file.</p>;
  if (!data?.libraries) return null;

  const sorted = [...data.libraries].sort(
    (a: ClientLibrary, b: ClientLibrary) => {
      const titleA = a.title || a.slug;
      const titleB = b.title || b.slug;
      return titleA.localeCompare(titleB);
    }
  );

  if (sorted.length === 0) return null;

  const filteredWithScores = sorted.flatMap(lib => {
    const displayText = lib.title || lib.slug;
    const { score, matchIndices } = filterQuery
      ? scoreMatch(filterQuery, displayText)
      : { score: 0, matchIndices: [] };
    if (filterQuery && score === 0) return [];
    return [{ lib, displayText, matchIndices, score }];
  });

  const displayed = filterQuery
    ? [...filteredWithScores].sort(
        (a, b) =>
          b.score - a.score || a.displayText.localeCompare(b.displayText)
      )
    : filteredWithScores;

  const resultCount = displayed.length;
  const statusMessage = filterQuery
    ? resultCount === 0
      ? "No libraries match."
      : `${resultCount} ${
          resultCount === 1 ? "library" : "libraries"
        } shown, best matches first`
    : "";

  return (
    <ThemeUIProvider theme={theme}>
      <Themed.root
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          m: 3
        }}
      >
        <h1>{instanceName} Home</h1>
        <h2>Choose a library:</h2>
        <div sx={{ display: "inline-block", width: "44ch", mb: 2 }}>
          <TextInput
            type="search"
            aria-label="Filter libraries"
            aria-controls={RESULTS_LIST_ID}
            placeholder="Filter libraries..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </div>
        {/* Always in the DOM so screen readers register the live region before content changes. */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          sx={{ variant: "accessibility.visuallyHidden" }}
        >
          {statusMessage}
        </div>
        {filterQuery && resultCount === 0 && (
          <p sx={{ pl: 2 }}>No libraries match.</p>
        )}
        <ul id={RESULTS_LIST_ID}>
          {displayed.map(({ lib, displayText, matchIndices }) => (
            <li key={lib.slug}>
              <LibraryHomeLink slug={lib.slug} title={lib.title}>
                <HighlightedText
                  text={displayText}
                  matchIndices={matchIndices}
                />
              </LibraryHomeLink>
            </li>
          ))}
        </ul>
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;
