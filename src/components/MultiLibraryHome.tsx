/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useDialogStore } from "@ariakit/react/dialog";
import { useAppConfig } from "components/context/AppConfigContext";
import theme from "theme/theme";
import Button from "components/Button";
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
  parseLibraryListParam,
  resolveLibraryList,
  PROMOTE_QUERY_PARAM,
  PROMOTE_LABEL_QUERY_PARAM,
  PROMOTE_ORDER_QUERY_PARAM
} from "utils/libraryListParam";
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
  // Set by a confirmed add, so the effect below moves focus to the My
  // Libraries heading once it shows.
  const [focusMyLibraries, setFocusMyLibraries] = React.useState(false);
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
    if (!focusMyLibraries || !hasPinned) return;
    setFocusMyLibraries(false);
    myLibrariesHeadingRef.current?.focus();
  }, [focusMyLibraries, hasPinned]);

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
    setFocusMyLibraries(true);
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

  const byName = (a: ClientLibrary, b: ClientLibrary) =>
    (a.title || a.slug).localeCompare(b.title || b.slug);
  const sorted = [...data.libraries].sort(byName);
  const librariesBySlug = new Map(sorted.map(lib => [lib.slug, lib]));

  /*
   * A `?promote=` query shows the named libraries as their own group, in
   * link order, or by library name when `?promoteOrder=name`. The group
   * is display-only: nothing is stored, so the parameter stays in the URL
   * and the page works as a shareable curated view. `?promoteLabel=`
   * overrides the group's localized heading and is rendered as plain text.
   * Both companion parameters are ignored when `?promote=` names no
   * available library.
   */
  const promoted = resolveLibraryList(
    parseLibraryListParam(router.query[PROMOTE_QUERY_PARAM]),
    data.libraries
  );
  if (firstParamValue(router.query[PROMOTE_ORDER_QUERY_PARAM]) === "name") {
    promoted.sort(byName);
  }
  const promotedLabel =
    firstParamValue(router.query[PROMOTE_LABEL_QUERY_PARAM])?.trim() ||
    t("multiLibraryHome.promotedHeading", "Promoted libraries");

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
          headingRef={myLibrariesHeadingRef}
          actions={
            <>
              {/* Screen readers hear the result through `announce`. */}
              {copyStatus === "copied" && (
                <span sx={{ fontSize: 0 }}>{copiedMessage}</span>
              )}
              {copyStatus === "error" && (
                <span sx={{ fontSize: 0, color: "ui.error" }}>
                  {failedMessage}
                </span>
              )}
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
            </>
          }
        />
        {promoted.length > 0 && !reordering && (
          <section>
            <h2>{promotedLabel}</h2>
            <LibraryCardList>
              {promoted.map(library => (
                <li key={library.id}>{renderCard(library)}</li>
              ))}
            </LibraryCardList>
          </section>
        )}
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
