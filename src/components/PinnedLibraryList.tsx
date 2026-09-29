import * as React from "react";
import type { ClientLibrary } from "pages/api/libraries";
import Button from "components/Button";
import LibraryCardList from "components/LibraryCardList";
import usePublicWarningHidden from "hooks/usePublicWarningHidden";
import { showPublicWarning } from "utils/publicWarning";
import {
  usePinnedLibraries,
  usePinningEnabled
} from "components/context/PinnedLibrariesContext";
import { useTranslation } from "next-i18next/pages";

interface PinnedLibraryListProps {
  /** The current server library list. */
  libraries: ClientLibrary[];
  /** The pinned libraries to show, from `useShownPinnedLibraries`. */
  pinned: ClientLibrary[];
  /** Renders the card for one pinned library. */
  renderItem: (library: ClientLibrary) => React.ReactNode;
  /**
   * Receives focus after the last unpin, so the user lands somewhere
   * predictable (e.g. the library search input) instead of wherever the
   * unpinned library's other pin button sits. Should be focusable.
   */
  emptyFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * The pinned libraries to show, in pinned order, resolved by id against the
 * current server library list. Pinned libraries missing from that list are
 * left out. Empty when pinning is disabled. The logo falls back to the one
 * stored with the pin.
 */
export function useShownPinnedLibraries(
  libraries: ClientLibrary[]
): ClientLibrary[] {
  const pinningEnabled = usePinningEnabled();
  const { pinnedLibraries } = usePinnedLibraries();
  if (!pinningEnabled) return [];
  const librariesById = new Map(libraries.map(lib => [lib.id, lib]));
  return pinnedLibraries.flatMap(entry => {
    const library = librariesById.get(entry.id);
    if (!library) return [];
    return [{ ...library, logoUrl: library.logoUrl ?? entry.logoUrl }];
  });
}

/**
 * The "My Libraries" section. Renders nothing when `pinned` is empty. Also
 * refreshes the stored pinned entries from the server list. While the
 * public computer warning is turned off, offers to turn it back on.
 *
 * When a pin or unpin made in this page leaves focus nowhere, focus returns
 * to the control that made it. If that control is gone, focus moves to the
 * library's pin button in this list after a pin, or to a neighboring
 * library's pin button after an unpin, or to the section heading when no
 * such button exists. After the last unpin, it moves to `emptyFocusRef`,
 * or to that library's pin button elsewhere on the page.
 */
const PinnedLibraryList: React.FC<PinnedLibraryListProps> = ({
  libraries,
  pinned,
  renderItem,
  emptyFocusRef
}) => {
  const { t } = useTranslation();
  const { pinnedLibraries, syncWithAvailable, takeFocusOrigin } =
    usePinnedLibraries();

  // Also reruns when the pinned list changes, so entries read from storage
  // after this list mounted get refreshed too. A sync with nothing to change
  // does not update state.
  React.useEffect(() => {
    syncWithAvailable(libraries);
  }, [libraries, pinnedLibraries, syncWithAvailable]);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const warningHidden = usePublicWarningHidden();

  const restoreWarning = () => {
    showPublicWarning();
    // The button removes itself, so keep focus in the section.
    headingRef.current?.focus();
  };
  const shownCount = pinned.length;

  // A string, so the effect below runs only when the shown ids change.
  const pinnedIdsKey = JSON.stringify(pinned.map(library => library.id));
  const previousIds = React.useRef<string[]>(JSON.parse(pinnedIdsKey));
  React.useEffect(() => {
    const pinnedIds: string[] = JSON.parse(pinnedIdsKey);
    const removedFrom = previousIds.current;
    previousIds.current = pinnedIds;
    const origin = takeFocusOrigin();
    if (!origin || pinnedIds.length === removedFrom.length) return;

    const pinButtonIn = (
      root: ParentNode | null | undefined,
      libraryId: string | undefined
    ) =>
      Array.from(
        root?.querySelectorAll<HTMLElement>("[data-pin-library]") ?? []
      ).find(button => libraryId && button.dataset.pinLibrary === libraryId);
    const pinButtonFor = (libraryId: string | undefined) =>
      pinButtonIn(sectionRef.current, libraryId);

    // Picks the replacement described in the component comment.
    const replacementFor = (libraryId: string | null) => {
      if (!libraryId) return headingRef.current ?? emptyFocusRef?.current;
      const pinnedButton = pinButtonFor(libraryId);
      if (pinnedButton) return pinnedButton;
      if (pinnedIds.length === 0) {
        return emptyFocusRef?.current ?? pinButtonIn(document, libraryId);
      }
      const removedAt = removedFrom.indexOf(libraryId);
      const neighbor = pinnedIds[Math.min(removedAt, pinnedIds.length - 1)];
      return pinButtonFor(neighbor) ?? headingRef.current;
    };

    const active = document.activeElement;
    if (active && active !== document.body) return;
    if (origin.isConnected) {
      origin.focus();
      return;
    }
    replacementFor(origin.getAttribute("data-pin-library"))?.focus();
  }, [pinnedIdsKey, emptyFocusRef, takeFocusOrigin]);

  if (shownCount === 0) return null;

  return (
    <section ref={sectionRef}>
      <h2 ref={headingRef} tabIndex={-1}>
        {t("library.myLibraries", "My Libraries", { ns: "common" })}
      </h2>
      {warningHidden && (
        <Button
          variant="link"
          color="ui.link.primary"
          onClick={restoreWarning}
          sx={{ mb: 2 }}
        >
          {t(
            "pinnedLibraryList.resetWarning",
            "Reset the shared computer warning"
          )}
        </Button>
      )}
      <LibraryCardList>
        {pinned.map(library => (
          <li key={library.id}>{renderItem(library)}</li>
        ))}
      </LibraryCardList>
    </section>
  );
};

export default PinnedLibraryList;
