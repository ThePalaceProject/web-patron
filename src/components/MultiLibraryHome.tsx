/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import useSWR from "swr";
import { useAppConfig } from "components/context/AppConfigContext";
import theme from "theme/theme";
import LibraryHomeLink from "./LibraryHomeLink";
import LibraryFilterList from "components/LibraryFilterList";
import LibraryCard from "components/LibraryCard";
import PinButton from "components/PinButton";
import PinnedLibraryList, {
  useShownPinnedLibraries
} from "components/PinnedLibraryList";
import { fetchLibraries } from "dataflow/fetchLibraries";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";
import { useTranslation } from "next-i18next/pages";
import MultiLibraryLandingPageHeader from "./layouts/MultiLibraryLandingPageHeader";

const MultiLibraryHome: React.FC = () => {
  const { t } = useTranslation();
  const { instanceName } = useAppConfig();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchKey, resetSearch] = React.useReducer((n: number) => n + 1, 0);
  const { data, error } = useSWR<LibrariesResponse>(
    "/api/libraries",
    fetchLibraries
  );
  const shownPinned = useShownPinnedLibraries(data?.libraries ?? []);
  const hasPinned = shownPinned.length > 0;
  const [reordering, setReordering] = React.useState(false);
  // Leaves reorder mode once fewer than two libraries are shown. Otherwise
  // the search would stay hidden with no Done button, and My Libraries would
  // come back already in that mode.
  if (reordering && shownPinned.length < 2) setReordering(false);

  if (error)
    return (
      <p>
        {t(
          "multiLibraryHome.unableToLoad",
          "Unable to load static libraries from configuration file."
        )}
      </p>
    );
  if (!data) return null;
  if (!data.libraries?.length)
    return (
      <p>
        {t("library.noLibrariesAvailable", "No libraries available.", {
          ns: "common"
        })}
      </p>
    );

  const sorted = [...data.libraries].sort(
    (a: ClientLibrary, b: ClientLibrary) => {
      const titleA = a.title || a.slug;
      const titleB = b.title || b.slug;
      return titleA.localeCompare(titleB);
    }
  );
  const librariesBySlug = new Map(sorted.map(lib => [lib.slug, lib]));

  // `title` replaces the name as the link content, e.g. to mark search
  // matches. `reorderControls` replace the pin button, and the link becomes
  // plain text, so the card cannot be opened while it is being reordered.
  const renderCard = (
    library: ClientLibrary,
    {
      title,
      reorderControls
    }: { title?: React.ReactNode; reorderControls?: React.ReactNode } = {}
  ) => {
    const name = library.title || library.slug;
    return (
      <LibraryCard
        logoUrl={library.logoUrl}
        description={library.description}
        disabled={reorderControls !== undefined}
        trailing={
          reorderControls ?? (
            <PinButton
              library={{
                id: library.id,
                slug: library.slug,
                title: name,
                logoUrl: library.logoUrl,
                authDocUrl: library.authDocUrl
              }}
              onToggle={resetSearch}
            />
          )
        }
      >
        {actionProps =>
          reorderControls === undefined ? (
            <LibraryHomeLink slug={library.slug} {...actionProps}>
              {title ?? name}
            </LibraryHomeLink>
          ) : (
            // Keeps the title's weight, but not its link color.
            <span sx={{ fontWeight: "medium" }}>{name}</span>
          )
        }
      </LibraryCard>
    );
  };

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
        <MultiLibraryLandingPageHeader
          heading={`${instanceName} ${t("multiLibraryHome.home", "Home")}`}
        />
        <PinnedLibraryList
          libraries={data.libraries}
          pinned={shownPinned}
          renderItem={(library, reorderControls) =>
            renderCard(library, { reorderControls })
          }
          reordering={reordering}
          onReorderingChange={setReordering}
          emptyFocusRef={searchInputRef}
        />
        {/* Hidden while reordering, so the page shows only My Libraries. */}
        {!reordering && (
          <LibraryFilterList
            // A pin or unpin made here starts a fresh search: the box empties
            // and, with pins shown, the list hides.
            key={searchKey}
            inputRef={searchInputRef}
            heading={
              <h2>
                {hasPinned
                  ? t("library.findAnother", "Find another library:", {
                      ns: "common"
                    })
                  : t("multiLibraryHome.choose", "Choose a library:")}
              </h2>
            }
            hideUntilFiltered={hasPinned}
            items={sorted.map(lib => ({
              slug: lib.slug,
              label: lib.title || lib.slug
            }))}
            resultsListId="library-filter-results"
            renderItem={({ slug, highlighted }) => {
              const library = librariesBySlug.get(slug);
              return library
                ? renderCard(library, { title: highlighted })
                : null;
            }}
          />
        )}
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;
