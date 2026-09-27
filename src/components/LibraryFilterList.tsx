import * as React from "react";
import TextInput from "components/TextInput";
import HighlightedText from "components/HighlightedText";
import LibraryCardList from "components/LibraryCardList";
import { scoreMatch } from "utils/libraryFilter";
import { useTranslation } from "next-i18next/pages";

const FILTER_DEBOUNCE_MS = 200;

export interface LibraryFilterItem {
  /** Unique identifier, used as the React key for each result. */
  slug: string;
  /** Plain text used for scoring, filtering, and display. */
  label: string;
}

interface LibraryFilterListProps {
  heading: React.ReactNode;
  items: LibraryFilterItem[];
  /** Renders the content inside each result's <li>. */
  renderItem: (
    item: LibraryFilterItem & { highlighted: React.ReactNode }
  ) => React.ReactNode;
  resultsListId: string;
  /** Show results only while the search box holds a filter. */
  hideUntilFiltered?: boolean;
}

const LibraryFilterList: React.FC<LibraryFilterListProps> = ({
  heading,
  items,
  renderItem,
  resultsListId,
  hideUntilFiltered = false
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = React.useState("");
  const [filterQuery, setFilterQuery] = React.useState("");
  const hintId = React.useId();
  const headingId = React.useId();
  const labelId = React.useId();

  React.useEffect(() => {
    const timer = setTimeout(
      () => setFilterQuery(inputValue),
      FILTER_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filteredWithScores = items.flatMap(item => {
    const { score, matchIndices } = filterQuery
      ? scoreMatch(filterQuery, item.label)
      : { score: 0, matchIndices: [] };
    if (filterQuery && score === 0) return [];
    return [{ item, matchIndices, score }];
  });

  const displayed = filterQuery
    ? [...filteredWithScores].sort(
        (a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label)
      )
    : filteredWithScores;

  const NO_MATCH_MESSAGE = t(
    "libraryFilterList.noLibrariesMatch",
    "No libraries match."
  );
  const resultCount = displayed.length;
  const showResults = !hideUntilFiltered || filterQuery !== "";
  const statusMessage = filterQuery
    ? resultCount === 0
      ? NO_MATCH_MESSAGE
      : t(
          "libraryFilterList.librariesMatched",
          "{{count}} libraries shown, best matches first",
          {
            count: resultCount,
            defaultValue_one: "{{count}} library shown, best matches first"
          }
        )
    : "";

  return (
    <>
      <div id={headingId}>{heading}</div>
      <div sx={{ width: ["auto", "44ch"], mb: 2 }}>
        <span id={labelId} sx={{ variant: "accessibility.visuallyHidden" }}>
          {t("libraryFilterList.search.ariaLabel", "Filter libraries")}
        </span>
        <TextInput
          type="search"
          // Named by the heading and its own label, e.g. "Find another
          // library: Filter libraries", so it makes sense on its own.
          aria-labelledby={`${headingId} ${labelId}`}
          aria-controls={showResults ? resultsListId : undefined}
          aria-describedby={hideUntilFiltered ? hintId : undefined}
          placeholder={t(
            "libraryFilterList.search.placeholder",
            "Filter libraries..."
          )}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        {hideUntilFiltered && (
          <span id={hintId} sx={{ variant: "accessibility.visuallyHidden" }}>
            {t(
              "libraryFilterList.hiddenResultsHint",
              "Matching libraries appear as you type."
            )}
          </span>
        )}
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
        <p sx={{ pl: 2 }}>{NO_MATCH_MESSAGE}</p>
      )}
      {showResults && (
        <LibraryCardList id={resultsListId}>
          {displayed.map(({ item, matchIndices }) => (
            <li key={item.slug}>
              {renderItem({
                ...item,
                highlighted: (
                  <HighlightedText
                    text={item.label}
                    matchIndices={matchIndices}
                  />
                )
              })}
            </li>
          ))}
        </LibraryCardList>
      )}
    </>
  );
};

export default LibraryFilterList;
