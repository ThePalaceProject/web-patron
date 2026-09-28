import * as React from "react";
import { createPortal } from "react-dom";
import AppConfigContext from "components/context/AppConfigContext";
import { VISUALLY_HIDDEN_STYLE } from "constants/a11y";
import { fetchLibraryLogo } from "dataflow/fetchLibraries";
import { PinnedLibrary } from "interfaces";
import type { ClientLibrary } from "pages/api/libraries";
import {
  PINNED_LIBRARIES_KEY,
  readPinnedLibraries,
  writePinnedLibraries,
  withMovedTo,
  withPinned,
  withoutPinned,
  syncPinned
} from "utils/pinnedLibraries";

/**
 * A library that can be pinned. authDocUrl is used only to fetch the logo
 * at pin time (from the browser) and is never stored.
 */
export type PinnableLibrary = Omit<PinnedLibrary, "pinnedAt"> & {
  authDocUrl?: string;
};

export type PinnedLibrariesState = {
  pinnedLibraries: PinnedLibrary[];
  pinLibrary: (library: PinnableLibrary) => void;
  unpinLibrary: (id: string) => void;
  /**
   * Moves a pinned library to the stored position of the library whose id
   * is `targetId`. Unknown ids are no-ops.
   */
  movePinnedLibrary: (id: string, targetId: string) => void;
  isPinned: (id: string) => boolean;
  /**
   * Refreshes pinned entries from the current server library list, matched
   * by id. Entries absent from the list are kept unchanged.
   */
  syncWithAvailable: (available: ClientLibrary[]) => void;
  /**
   * Records the control that started a pin or unpin, so a pinned library
   * list can restore focus if that change removes the focused element.
   */
  markFocusOrigin: (element: HTMLElement | null) => void;
  /**
   * Returns and clears the recorded control. Null when none was recorded in
   * the last FOCUS_ORIGIN_TTL_MS, so changes from other tabs or from
   * storage loading do not move focus.
   */
  takeFocusOrigin: () => HTMLElement | null;
  /**
   * Has screen readers read `message` politely, e.g. after a pin. The text
   * is written after ANNOUNCE_DELAY_MS and cleared after ANNOUNCEMENT_TTL_MS.
   */
  announce: (message: string) => void;
};

/** How long a recorded focus origin stays valid, in milliseconds. */
const FOCUS_ORIGIN_TTL_MS = 1000;

/**
 * Delay before an announcement is written, in milliseconds, so a closing
 * modal dialog has released the region and a focus move has settled.
 */
export const ANNOUNCE_DELAY_MS = 150;

/** How long an announcement stays in the region, in milliseconds. */
export const ANNOUNCEMENT_TTL_MS = 5000;

const PinnedLibrariesContext = React.createContext<
  PinnedLibrariesState | undefined
>(undefined);

/**
 * Whether the pinning feature flag (PALACE_CPW_FEATURE_PINNING) is on.
 * Reads the app config optionally so callers outside an
 * AppConfigContext.Provider get the safe default (off) instead of a throw.
 */
export function usePinningEnabled(): boolean {
  return React.useContext(AppConfigContext)?.enablePinning ?? false;
}

export const PinnedLibrariesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const enabled = usePinningEnabled();
  const [pinnedLibraries, setPinnedLibraries] = React.useState<PinnedLibrary[]>(
    []
  );

  /*
   * Storage is read after mount rather than in the initial state so the
   * server and client first renders match (no hydration mismatch). With the
   * feature flag off, stored entries are ignored entirely.
   */
  React.useEffect(() => {
    if (enabled) setPinnedLibraries(readPinnedLibraries());
  }, [enabled]);

  /*
   * The storage event fires only in other tabs, so refreshing from storage
   * here keeps this tab in sync with writes made elsewhere without looping
   * on its own writes. A null key means storage was cleared.
   */
  React.useEffect(() => {
    if (!enabled) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === PINNED_LIBRARIES_KEY || event.key === null) {
        setPinnedLibraries(readPinnedLibraries());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [enabled]);

  /*
   * Applies an updater to the current list and persists the result. Updaters
   * return the previous array unchanged when there is nothing to do, which
   * skips the write. The write is idempotent, so a re-invoked updater (e.g.
   * under StrictMode) is harmless.
   */
  const update = React.useCallback(
    (updater: (prev: PinnedLibrary[]) => PinnedLibrary[]) => {
      if (!enabled) return;
      setPinnedLibraries(prev => {
        const next = updater(prev);
        if (next !== prev) writePinnedLibraries(next);
        return next;
      });
    },
    [enabled]
  );

  const pinLibrary = React.useCallback(
    (library: PinnableLibrary) => {
      if (!enabled) return;
      /*
       * Only the fields below are ever persisted; authDocUrl and any other
       * extra fields on the caller's object are dropped here.
       */
      const { id, slug, title, logoUrl, authDocUrl } = library;
      const entry = { id, slug, title, ...(logoUrl && { logoUrl }) };
      update(prev => withPinned(prev, entry));
      if (logoUrl || !authDocUrl) return;
      /*
       * Pins made from the library list carry no logo (the list has none),
       * so read it from the library's authentication document in the
       * browser and backfill the stored entry. A failure leaves the entry
       * without a logo. The backfill writes through this tab's state, so an
       * unpin made in another tab while the fetch is in flight can be
       * overwritten; accepted, since the window is small and the stakes are
       * one resurrected pin.
       */
      fetchLibraryLogo(authDocUrl)
        .then(logoUrl => {
          if (!logoUrl) return;
          update(prev => {
            const pinned = prev.find(lib => lib.id === entry.id);
            if (!pinned || pinned.logoUrl) return prev;
            return prev.map(lib =>
              lib.id === entry.id ? { ...lib, logoUrl } : lib
            );
          });
        })
        .catch(() => undefined);
    },
    [enabled, update]
  );

  const unpinLibrary = React.useCallback(
    (id: string) => update(prev => withoutPinned(prev, id)),
    [update]
  );

  const movePinnedLibrary = React.useCallback(
    (id: string, targetId: string) =>
      update(prev => withMovedTo(prev, id, targetId)),
    [update]
  );

  const syncWithAvailable = React.useCallback(
    (available: ClientLibrary[]) => update(prev => syncPinned(prev, available)),
    [update]
  );

  const focusOrigin = React.useRef<{ element: HTMLElement; at: number }>(
    undefined
  );

  const markFocusOrigin = React.useCallback((element: HTMLElement | null) => {
    focusOrigin.current = element
      ? { element, at: performance.now() }
      : undefined;
  }, []);

  const takeFocusOrigin = React.useCallback(() => {
    const origin = focusOrigin.current;
    focusOrigin.current = undefined;
    if (!origin || performance.now() - origin.at > FOCUS_ORIGIN_TTL_MS) {
      return null;
    }
    return origin.element;
  }, []);

  // The id gives each message a fresh node, so a repeated message is read
  // again.
  const [announcement, setAnnouncement] = React.useState({ id: 0, text: "" });
  // The announcement region is portaled to the body, which exists only in
  // the browser.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const announceTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const clearTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(
    () => () => {
      clearTimeout(announceTimer.current);
      clearTimeout(clearTimer.current);
    },
    []
  );
  const announce = React.useCallback((text: string) => {
    clearTimeout(announceTimer.current);
    clearTimeout(clearTimer.current);
    announceTimer.current = setTimeout(() => {
      setAnnouncement(prev => ({ id: prev.id + 1, text }));
      // Clearing keeps a stale message out of the page for browse mode.
      clearTimer.current = setTimeout(
        () => setAnnouncement(prev => ({ ...prev, text: "" })),
        ANNOUNCEMENT_TTL_MS
      );
    }, ANNOUNCE_DELAY_MS);
  }, []);

  const isPinned = React.useCallback(
    (id: string) => pinnedLibraries.some(lib => lib.id === id),
    [pinnedLibraries]
  );

  const value = React.useMemo(
    () => ({
      pinnedLibraries,
      pinLibrary,
      unpinLibrary,
      movePinnedLibrary,
      isPinned,
      syncWithAvailable,
      markFocusOrigin,
      takeFocusOrigin,
      announce
    }),
    [
      pinnedLibraries,
      pinLibrary,
      unpinLibrary,
      movePinnedLibrary,
      isPinned,
      syncWithAvailable,
      markFocusOrigin,
      takeFocusOrigin,
      announce
    ]
  );

  return (
    <PinnedLibrariesContext.Provider value={value}>
      {children}
      {enabled &&
        mounted &&
        createPortal(
          <div role="status" aria-live="polite" style={VISUALLY_HIDDEN_STYLE}>
            <span key={announcement.id}>{announcement.text}</span>
          </div>,
          document.body
        )}
    </PinnedLibrariesContext.Provider>
  );
};

export function usePinnedLibraries(): PinnedLibrariesState {
  const context = React.useContext(PinnedLibrariesContext);
  if (typeof context === "undefined") {
    throw new Error(
      "usePinnedLibraries must be used within a PinnedLibrariesProvider"
    );
  }
  return context;
}

export default PinnedLibrariesContext;
