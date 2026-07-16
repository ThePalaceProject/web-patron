import * as React from "react";

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

export default HighlightedText;
