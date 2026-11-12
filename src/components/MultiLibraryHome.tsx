/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useDialogStore } from "@ariakit/react/dialog";
import theme from "theme/theme";
import Button from "components/Button";
import Add from "icons/Add";
import Share from "icons/Share";
import LibraryHomeLink from "./LibraryHomeLink";
import LibraryFilterList from "components/LibraryFilterList";
import LibraryCard from "components/LibraryCard";
import LibraryCardList from "components/LibraryCardList";
import AlertDialog, { AlertDialogActions } from "components/AlertDialog";
import PinButton from "components/PinButton";
import PinnedLibraryList, {
  useShownPinnedLibraries
} from "components/PinnedLibraryList";
import {
  usePinnedLibraries,
  usePinningEnabled
} from "components/context/PinnedLibrariesContext";
import { fetchLibraries } from "dataflow/fetchLibraries";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";
import {
  buildPinsPath,
  readPinnedLibraries,
  PINS_QUERY_PARAM
} from "utils/pinnedLibraries";
import { copyToClipboard } from "utils/clipboard";
import {
  firstParamValue,
  parsePromoteLabel,
  parseLibraryListParam,
  resolveLibraryList,
  PROMOTE_QUERY_PARAM,
  PROMOTE_LABEL_QUERY_PARAM,
  PROMOTE_ORDER_QUERY_PARAM
} from "utils/libraryListParam";
import { useTranslation } from "next-i18next/pages";
import MultiLibraryLandingPageHeader from "./layouts/MultiLibraryLandingPageHeader";

/*
 * Shows the My Libraries heading and buttons, and the add mode Done button,
 * in all caps. Use this one value for all of them, so the buttons match.
 */
const UPPERCASE_HEADER = true;

const MultiLibraryHome: React.FC = () => {
  const { t } = useTranslation();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { data, error } = useSWR<LibrariesResponse>(
    "/api/libraries",
    fetchLibraries
  );
  const shownPinned = useShownPinnedLibraries(data?.libraries ?? []);
  /*
   * The element that the effect below focuses once it shows. `unpin` names
   * the library whose Unpin button in My Libraries gets focus. The
   * `IfLost` values focus their element only when focus was lost, that is,
   * when the element that last had focus left the page.
   */
  const [pendingFocus, setPendingFocus] = React.useState<
    | "myLibraries"
    | "myLibrariesIfLost"
    | "search"
    | "searchIfLost"
    | "addLibrary"
    | { unpin: string }
    | null
  >(null);
  const lastFocusedRef = React.useRef<Element | null>(null);
  React.useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      lastFocusedRef.current = event.target as Element;
    };
    const handleFocusOut = (event: FocusEvent) => {
      // Focus that moves to another element is recorded on focusin.
      if (event.relatedTarget instanceof Element) return;
      const target = event.target;
      // Waits until a removal that caused the blur is done. A target that
      // is still on the page, with focus on the page body, was left by a
      // click on plain text, so focus was not lost.
      queueMicrotask(() => {
        const active = document.activeElement;
        if (
          lastFocusedRef.current === target &&
          (target as Element).isConnected &&
          (!active || active === document.body)
        ) {
          lastFocusedRef.current = null;
        }
      });
    };
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);
  const hasPinned = shownPinned.length > 0;
  const [reordering, setReordering] = React.useState(false);
  // Leaves reorder mode once fewer than two libraries are shown. Otherwise
  // the promoted group would stay hidden with no Done button, and My
  // Libraries would come back already in that mode.
  if (reordering && shownPinned.length < 2) setReordering(false);
  /*
   * Add mode hides My Libraries and shows the full library list, so the
   * user can pin a library. A pin made from that list, a confirmed `?pins=`
   * link, the Done button, or Escape ends it. With no pins left, the page
   * shows that list anyway, so add mode ends.
   */
  const [adding, setAdding] = React.useState(false);
  const [hadPinned, setHadPinned] = React.useState(hasPinned);
  if (hadPinned !== hasPinned) {
    setHadPinned(hasPinned);
    if (hasPinned) {
      // The search leaves with the first pin, so focus on it would be lost.
      setPendingFocus(prev => prev ?? "myLibrariesIfLost");
    } else {
      setAdding(false);
      // The My Libraries header and the Done button leave with the last
      // pin, so focus on them would be lost.
      setPendingFocus(prev => prev ?? "searchIfLost");
    }
  }
  const addLibraryButtonRef = React.useRef<HTMLButtonElement>(null);
  const filterAreaRef = React.useRef<HTMLDivElement>(null);

  const pinningEnabled = usePinningEnabled();
  const { pinLibrary, announce } = usePinnedLibraries();
  const myLibrariesHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  /*
   * The parameter is cleared on every close (confirm, Cancel, or Escape),
   * so a dismissed offer cannot come back on reload or re-open itself when
   * the offered set changes. The ref keeps the newest router without
   * re-creating the store.
   */
  const clearPinsParamRef = React.useRef<() => void>(() => undefined);
  const addDialog = useDialogStore({
    setOpen: open => {
      if (!open) clearPinsParamRef.current();
    }
  });
  const [librariesToAdd, setLibrariesToAdd] = React.useState<
    ClientLibrary[] | null
  >(null);
  const [copyStatus, setCopyStatus] = React.useState<
    "idle" | "copied" | "error"
  >("idle");
  const copyResetTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(copyResetTimer.current), []);
  /*
   * Ids of the libraries the dialog last offered to add. The effect below
   * can re-run while the same `pins` value is still in the query, for
   * example after a router or library list update. This guard keeps it from
   * offering the same set again.
   */
  const lastOfferRef = React.useRef("");

  const pinsValue = router.query[PINS_QUERY_PARAM];

  const clearPinsParam = React.useCallback(() => {
    const query = { ...router.query };
    delete query[PINS_QUERY_PARAM];
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true
    });
  }, [router]);
  React.useEffect(() => {
    clearPinsParamRef.current = clearPinsParam;
  });

  /*
   * A `?pins=` link populates My Libraries after confirmation. The link's
   * not-yet-pinned libraries are appended in link order. Existing pins are
   * never removed, moved, or duplicated. Unknown entries are ignored, and
   * a link with nothing to add is stripped from the URL without a dialog.
   * With pinning disabled the parameter is ignored and left in place.
   * The pinned check reads storage directly because the provider loads
   * storage into context in an effect that runs after this one.
   */
  const libraries = data?.libraries;
  React.useEffect(() => {
    if (!pinningEnabled || !libraries?.length) return;
    const tokens = parseLibraryListParam(pinsValue);
    if (tokens.length === 0) {
      lastOfferRef.current = "";
      return;
    }
    const storedIds = new Set(readPinnedLibraries().map(lib => lib.id));
    const toAdd = resolveLibraryList(tokens, libraries).filter(
      lib => !storedIds.has(lib.id)
    );
    if (toAdd.length === 0) {
      lastOfferRef.current = "";
      setLibrariesToAdd(null);
      // Closing an open dialog clears the parameter via the store hook.
      if (addDialog.getState().open) addDialog.hide();
      else clearPinsParam();
      return;
    }
    const offerKey = toAdd.map(lib => lib.id).join(",");
    if (lastOfferRef.current === offerKey) return;
    lastOfferRef.current = offerKey;
    setLibrariesToAdd(toAdd);
    addDialog.show();
  }, [pinningEnabled, libraries, pinsValue, addDialog, clearPinsParam]);

  React.useEffect(() => {
    if (!pendingFocus) return;
    if (
      pendingFocus === "searchIfLost" ||
      pendingFocus === "myLibrariesIfLost"
    ) {
      setPendingFocus(null);
      const active = document.activeElement;
      const last = lastFocusedRef.current;
      const lost =
        (!active || active === document.body) &&
        last !== null &&
        !last.isConnected;
      const fallback =
        pendingFocus === "searchIfLost"
          ? searchInputRef
          : myLibrariesHeadingRef;
      if (lost) fallback.current?.focus();
      return;
    }
    const unpinButtonFor = (libraryId: string) =>
      Array.from(
        myLibrariesHeadingRef.current
          ?.closest("section")
          ?.querySelectorAll<HTMLElement>("[data-pin-library]") ?? []
      ).find(button => button.dataset.pinLibrary === libraryId) ??
      myLibrariesHeadingRef.current;
    const target =
      typeof pendingFocus === "object"
        ? unpinButtonFor(pendingFocus.unpin)
        : {
            myLibraries: myLibrariesHeadingRef,
            search: searchInputRef,
            addLibrary: addLibraryButtonRef
          }[pendingFocus].current;
    if (!target) return;
    setPendingFocus(null);
    target.focus();
  }, [pendingFocus, hasPinned, adding]);

  const startAdding = () => {
    setAdding(true);
    setPendingFocus("search");
  };
  const finishAdding = React.useCallback(() => {
    setAdding(false);
    setPendingFocus("addLibrary");
  }, []);
  const finishAddingWithPin = (libraryId: string) => {
    setAdding(false);
    setPendingFocus({ unpin: libraryId });
  };

  /*
   * In add mode, Escape acts as the Done button while focus is in the
   * search area. The listener is on the DOM element, so Escape in a dialog,
   * which renders in a portal outside it, only closes the dialog.
   */
  React.useEffect(() => {
    const area = filterAreaRef.current;
    if (!adding || !area) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing || event.defaultPrevented)
        return;
      event.preventDefault();
      finishAdding();
    };
    area.addEventListener("keydown", handleKeyDown);
    return () => area.removeEventListener("keydown", handleKeyDown);
  }, [adding, finishAdding]);

  const confirmAdd = () => {
    const added = librariesToAdd ?? [];
    added.forEach(lib =>
      pinLibrary({
        id: lib.id,
        slug: lib.slug,
        title: lib.title,
        logoUrl: lib.logoUrl,
        authDocUrl: lib.authDocUrl
      })
    );
    announce(
      t(
        "multiLibraryHome.addFromLink.added",
        "{{count}} libraries added to My Libraries.",
        {
          count: added.length,
          defaultValue_one: "{{count}} library added to My Libraries."
        }
      )
    );
    setAdding(false);
    setPendingFocus("myLibraries");
    addDialog.hide();
  };

  const cancelAdd = () => addDialog.hide();

  const copiedMessage = t("multiLibraryHome.share.copied", "Link copied.");
  const failedMessage = t(
    "multiLibraryHome.share.failed",
    "Could not copy link."
  );

  // The link names only the pinned libraries shown on the page, so it
  // matches what the user sees.
  const handleCopyLink = async () => {
    const url = `${window.location.origin}${buildPinsPath(shownPinned)}`;
    const success = await copyToClipboard(url);
    setCopyStatus(success ? "copied" : "error");
    announce(success ? copiedMessage : failedMessage);
    clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyStatus("idle"), 2000);
  };

  // A failed refresh keeps the loaded list on screen.
  if (error && !data)
    return (
      <p>
        {t("multiLibraryHome.unableToLoad", "Unable to load the library list.")}
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

  const byName = (a: ClientLibrary, b: ClientLibrary) =>
    (a.title || a.slug).localeCompare(b.title || b.slug);
  const sorted = [...data.libraries].sort(byName);
  const librariesBySlug = new Map(sorted.map(lib => [lib.slug, lib]));

  /*
   * A `?promote=` query shows the named libraries as their own group, in
   * link order, or by library name when `?promoteOrder=name`. The group
   * is display-only: nothing is stored, so the parameter stays in the URL
   * and the page works as a shareable curated view. Libraries already shown
   * in My Libraries are left out, and the group hides entirely once nothing
   * remains. `?promoteLabel=` overrides the group's localized heading, is
   * cut to `PROMOTE_LABEL_MAX_LENGTH` characters, and is rendered as plain
   * text. A label holding a URL, email address, or phone number is
   * ignored. Both companion parameters are ignored when `?promote=` names
   * no library the group would show.
   */
  const shownPinnedIds = new Set(shownPinned.map(lib => lib.id));
  const promoted = resolveLibraryList(
    parseLibraryListParam(router.query[PROMOTE_QUERY_PARAM]),
    data.libraries
  ).filter(lib => !shownPinnedIds.has(lib.id));
  if (firstParamValue(router.query[PROMOTE_ORDER_QUERY_PARAM]) === "name") {
    promoted.sort(byName);
  }
  const promotedLabel =
    parsePromoteLabel(router.query[PROMOTE_LABEL_QUERY_PARAM]) ??
    t("multiLibraryHome.promotedHeading", "Promoted libraries");

  // `title` replaces the name as the link content, e.g. to mark search
  // matches. `reorderControls` replace the pin button, and the link becomes
  // plain text, so the card cannot be opened while it is being reordered.
  // `onPin` runs after the card's pin button pins the library.
  const renderCard = (
    library: ClientLibrary,
    {
      title,
      reorderControls,
      onPin
    }: {
      title?: React.ReactNode;
      reorderControls?: React.ReactNode;
      onPin?: () => void;
    } = {}
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
              onPin={onPin}
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
        <MultiLibraryLandingPageHeader />
        {/* Hidden in add mode, so the page shows only the library list. */}
        {!adding && (
          <PinnedLibraryList
            libraries={data.libraries}
            pinned={shownPinned}
            renderItem={(library, reorderControls) =>
              renderCard(library, { reorderControls })
            }
            reordering={reordering}
            onReorderingChange={setReordering}
            emptyFocusRef={searchInputRef}
            headingRef={myLibrariesHeadingRef}
            uppercaseHeader={UPPERCASE_HEADER}
            actions={
              <span sx={{ position: "relative", display: "inline-flex" }}>
                <Button
                  variant="ghost"
                  color="ui.black"
                  onClick={handleCopyLink}
                  iconLeft={Share}
                  aria-label={t(
                    "multiLibraryHome.share.ariaLabel",
                    "Share My Libraries"
                  )}
                >
                  {t("multiLibraryHome.share.label", "Share")}
                </Button>
                {/*
                 * Floats below the button, so showing it moves nothing in
                 * the row. It starts at the button's left edge, so it stays
                 * on screen when the button is at the left of the page.
                 * Clicks pass through it to the content below. Screen
                 * readers hear the result through `announce`.
                 */}
                {copyStatus !== "idle" && (
                  <span
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      pointerEvents: "none",
                      zIndex: 1,
                      mt: 1,
                      px: 2,
                      py: 1,
                      whiteSpace: "nowrap",
                      fontSize: 0,
                      color: copyStatus === "error" ? "ui.error" : "ui.black",
                      bg: "ui.white",
                      border: "1px solid",
                      borderColor: "ui.gray.light",
                      borderRadius: "button"
                    }}
                  >
                    {copyStatus === "error" ? failedMessage : copiedMessage}
                  </span>
                )}
              </span>
            }
            trailingActions={
              <Button
                ref={addLibraryButtonRef}
                variant="ghost"
                color="ui.black"
                onClick={startAdding}
                iconLeft={Add}
                aria-label={t(
                  "multiLibraryHome.addLibrary.ariaLabel",
                  "Add library to My Libraries"
                )}
              >
                {t("multiLibraryHome.addLibrary.label", "Add library")}
              </Button>
            }
          />
        )}
        {promoted.length > 0 && !reordering && !adding && (
          <section>
            {/* A long label from the URL wraps, even without spaces. */}
            <h2 sx={{ overflowWrap: "anywhere" }}>{promotedLabel}</h2>
            <LibraryCardList>
              {promoted.map(library => (
                <li key={library.id}>{renderCard(library)}</li>
              ))}
            </LibraryCardList>
          </section>
        )}
        {/* With pins shown, the list appears only in add mode. */}
        {(!hasPinned || adding) && (
          <div ref={filterAreaRef}>
            <LibraryFilterList
              inputRef={searchInputRef}
              heading={
                <h2>
                  {adding
                    ? t("library.findAnother", "Find another library:", {
                        ns: "common"
                      })
                    : t("multiLibraryHome.choose", "Choose a library:")}
                </h2>
              }
              items={sorted.map(lib => ({
                slug: lib.slug,
                label: lib.title || lib.slug
              }))}
              resultsListId="library-filter-results"
              fullWidthSearch
              renderItem={({ slug, highlighted }) => {
                const library = librariesBySlug.get(slug);
                return library
                  ? renderCard(library, {
                      title: highlighted,
                      onPin: adding
                        ? () => finishAddingWithPin(library.id)
                        : undefined
                    })
                  : null;
              }}
              searchActions={
                adding && (
                  <Button
                    variant="ghost"
                    color="ui.black"
                    onClick={finishAdding}
                    aria-label={t(
                      "multiLibraryHome.addLibrary.doneAriaLabel",
                      "Done, back to My Libraries"
                    )}
                    aria-keyshortcuts="Escape"
                    sx={{
                      ...(UPPERCASE_HEADER && { textTransform: "uppercase" })
                    }}
                  >
                    {t("multiLibraryHome.addLibrary.done", "Done")}
                  </Button>
                )
              }
            />
          </div>
        )}
        <AlertDialog
          dialog={addDialog}
          title={t("multiLibraryHome.addFromLink.title", "Add to My Libraries")}
          message={t(
            "multiLibraryHome.addFromLink.message",
            "This link adds these libraries to My Libraries in this browser."
          )}
        >
          {/* Scrolls a long list, so the buttons below stay on screen. */}
          <ul sx={{ pl: 4, mb: 3, maxHeight: "40vh", overflowY: "auto" }}>
            {librariesToAdd?.map(lib => (
              <li key={lib.id}>{lib.title || lib.slug}</li>
            ))}
          </ul>
          <p sx={{ fontSize: "-1", color: "ui.gray.extraDark" }}>
            {t(
              "publicComputerWarning.pinMessage",
              "Pinning a library saves it in this browser. Do not pin libraries on a public or shared computer."
            )}
          </p>
          <AlertDialogActions
            onCancel={cancelAdd}
            confirmLabel={t(
              "multiLibraryHome.addFromLink.confirm",
              "Add libraries"
            )}
            onConfirm={confirmAdd}
          />
        </AlertDialog>
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;
