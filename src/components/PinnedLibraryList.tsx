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
   * Receives focus when unpinning the last library removes the focused
   * card along with the section. Should be focusable, e.g. a heading with
   * tabIndex={-1}.
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
 * to the control that made it or, if that control is gone, moves to the
 * section heading (or to `emptyFocusRef` when the section is gone).
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
  const headingId = React.useId();
  const warningHidden = usePublicWarningHidden();

  const restoreWarning = () => {
    showPublicWarning();
    // The button removes itself, so keep focus in the section.
    headingRef.current?.focus();
  };
  const shownCount = pinned.length;
  const previousCount = React.useRef(shownCount);
  React.useEffect(() => {
    if (shownCount === previousCount.current) return;
    previousCount.current = shownCount;
    const origin = takeFocusOrigin();
    const active = document.activeElement;
    if (!origin || (active && active !== document.body)) return;
    if (origin.isConnected) origin.focus();
    else
      (shownCount > 0 ? headingRef.current : emptyFocusRef?.current)?.focus();
  }, [shownCount, emptyFocusRef, takeFocusOrigin]);

  if (shownCount === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} ref={headingRef} tabIndex={-1}>
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
