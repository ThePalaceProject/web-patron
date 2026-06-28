import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";
import type { CatalogUrlResponse } from "pages/api/catalog-url";
import LibraryFilterList from "components/LibraryFilterList";
import { fetchLibraries } from "dataflow/fetchLibraries";
import { buildWorkUrl } from "utils/workUrl";

/*
 * Bounds a selection resolve (catalog URL lookup plus availability pre-flight)
 * so a hung server cannot leave every card blocked. On timeout the in-flight
 * fetch aborts and the generic connectivity error is shown.
 */
export const RESOLVE_TIMEOUT_MS = 15000;

interface WorkLibrarySelectorProps {
  workId: string;
}

const WorkLibrarySelector: React.FC<WorkLibrarySelectorProps> = ({
  workId
}) => {
  const { data, error } = useSWR<LibrariesResponse>(
    "/api/libraries",
    fetchLibraries
  );
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  /*
   * Slug of the card currently resolving a selection, or null. Held here
   * rather than per card so a resolve in flight blocks selection on every
   * card; otherwise two cards could race and the later navigation would win.
   */
  const [resolvingSlug, setResolvingSlug] = React.useState<string | null>(null);

  function focusSearch() {
    const input = searchContainerRef.current?.querySelector("input");
    input?.focus();
    searchContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  if (error) return <p>Unable to load the library list.</p>;
  if (!data?.libraries) return null;

  const sorted = [...data.libraries].sort((a, b) => {
    const titleA = a.title || a.slug;
    const titleB = b.title || b.slug;
    return titleA.localeCompare(titleB);
  });
  const librariesBySlug = new Map(sorted.map(lib => [lib.slug, lib]));

  return (
    <div ref={searchContainerRef}>
      <LibraryFilterList
        heading={<h2>Choose your library to view this item:</h2>}
        items={sorted.map(lib => ({
          slug: lib.slug,
          label: lib.title || lib.slug
        }))}
        resultsListId="work-library-selector-results"
        renderItem={({ slug, label, highlighted }) => {
          const library = librariesBySlug.get(slug);
          if (!library) return null;
          return (
            <LibrarySelectorCard
              library={library}
              workId={workId}
              label={label}
              highlighted={highlighted}
              onBackToSearch={focusSearch}
              resolvingSlug={resolvingSlug}
              onResolvingChange={setResolvingSlug}
            />
          );
        }}
      />
    </div>
  );
};

export default WorkLibrarySelector;

interface LibrarySelectorCardProps {
  library: ClientLibrary;
  workId: string;
  label: string;
  highlighted: React.ReactNode;
  onBackToSearch: () => void;
  /** Slug of the card currently resolving a selection, or null. */
  resolvingSlug: string | null;
  onResolvingChange: (slug: string | null) => void;
}

const LibrarySelectorCard: React.FC<LibrarySelectorCardProps> = ({
  library,
  workId,
  label,
  highlighted,
  onBackToSearch,
  resolvingSlug,
  onResolvingChange
}) => {
  const router = useRouter();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const userCancelledRef = React.useRef(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const anyResolving = resolvingSlug !== null;
  const isResolving = resolvingSlug === library.slug;

  /*
   * Escape cancels an in-flight resolve. Only the resolving card attaches the
   * listener, and it listens on document rather than the button so the cancel
   * works no matter where focus is. A user cancel aborts the same controller
   * as the timeout; userCancelledRef tells the catch below to reset quietly
   * instead of showing the connectivity error.
   */
  React.useEffect(() => {
    if (!isResolving) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        userCancelledRef.current = true;
        abortRef.current?.abort();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isResolving]);

  async function handleSelect() {
    // Reentrancy guard: buttons stay enabled while a resolve is in flight
    // (see the aria-disabled comment below), so activations during that time,
    // whether on this card or another, must be ignored here instead.
    if (anyResolving) return;
    onResolvingChange(library.slug);
    setErrorMessage(null);
    userCancelledRef.current = false;
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS);
    let destination = "";
    try {
      const res = await fetch(
        `/api/catalog-url?slug=${encodeURIComponent(library.slug)}`,
        { signal: controller.signal }
      );
      if (res.status === 404) {
        setErrorMessage("This library is unavailable.");
        onResolvingChange(null);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { catalogUrl }: CatalogUrlResponse = await res.json();
      const bookUrl = buildWorkUrl(catalogUrl, workId);

      // Pre-flight check: confirm the item exists in this library before
      // navigating away. A 404 means the item is not in the collection; 5xx
      // and network errors are reachability problems. Other error statuses
      // (e.g. 401 from a catalog that requires authentication to view
      // entries) leave availability unknown, so navigation proceeds and the
      // book page's own auth flow takes over. Only the status is needed, so
      // the body is cancelled rather than downloaded; the book page
      // re-fetches the entry after navigation. cancel is optionally called
      // because the whatwg-fetch polyfill used in tests has a non-stream body.
      const check = await fetch(bookUrl, { signal: controller.signal });
      check.body?.cancel?.();
      if (check.status === 404) {
        setErrorMessage(
          `The item with identifier “${workId}” is not currently ` +
            `available through this library (“${label}”).`
        );
        onResolvingChange(null);
        return;
      }
      if (check.status >= 500) throw new Error(`HTTP ${check.status}`);

      destination = `/${library.slug}/book/${encodeURIComponent(bookUrl)}`;
    } catch {
      if (!userCancelledRef.current) {
        setErrorMessage("Unable to reach this library.");
      }
      onResolvingChange(null);
      return;
    } finally {
      clearTimeout(timeoutId);
      abortRef.current = null;
    }
    // Outside the try above so a navigation failure is not mislabeled as a
    // library connectivity error.
    try {
      await router.push(destination);
    } catch {
      setErrorMessage("Unable to open this item.");
      onResolvingChange(null);
    }
  }

  return (
    <div sx={{ mb: 1 }}>
      {/*
       * A <button> rather than <a> is correct here: the destination URL is not
       * known until the async /api/catalog-url call resolves, so there is no
       * href to give a link. aria-busy signals the loading state to screen
       * readers; the visual "Opening…" span (which also advertises the Escape
       * cancel) is aria-hidden to avoid duplication.
       * aria-disabled is used instead of disabled while a resolve is in
       * flight so keyboard focus stays on the button (disabled would drop
       * focus to the body); handleSelect ignores activations made during the
       * resolve. Every card is marked disabled during a resolve because
       * selection is blocked everywhere, not just on the resolving card.
       * role="alert" on errors makes them announced without requiring focus;
       * it wraps only the message text so the buttons in the error panel are
       * not announced as live-region content.
       */}
      <button
        ref={buttonRef}
        onClick={handleSelect}
        aria-disabled={anyResolving}
        aria-busy={isResolving}
        sx={{
          background: "none",
          border: "none",
          p: 0,
          cursor: isResolving
            ? "wait"
            : anyResolving
              ? "not-allowed"
              : "pointer",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
          textDecoration: "underline"
        }}
      >
        {highlighted}
        {isResolving && (
          <span aria-hidden="true" sx={{ ml: 2, fontSize: 0 }}>
            Opening… (Esc to cancel)
          </span>
        )}
      </button>
      {errorMessage && (
        <div
          sx={{
            mt: 1,
            p: 2,
            border: "1px solid",
            borderColor: "ui.error",
            borderRadius: 2
          }}
        >
          <span
            role="alert"
            sx={{ display: "block", color: "ui.error", fontSize: 1, mb: 1 }}
          >
            {errorMessage}
          </span>
          <button
            onClick={() => {
              setErrorMessage(null);
              onBackToSearch();
            }}
            sx={{ mr: 2, cursor: "pointer" }}
          >
            Back to search
          </button>
          <button
            onClick={() => {
              setErrorMessage(null);
              requestAnimationFrame(() => buttonRef.current?.focus());
            }}
            sx={{ cursor: "pointer" }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
