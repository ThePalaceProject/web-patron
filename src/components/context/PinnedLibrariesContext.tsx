import * as React from "react";
import { fetchLibraryLogo } from "dataflow/fetchLibraries";
import { PinnedLibrary } from "interfaces";
import type { ClientLibrary } from "pages/api/libraries";
import {
  PINNED_LIBRARIES_KEY,
  readPinnedLibraries,
  writePinnedLibraries,
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
  isPinned: (id: string) => boolean;
  /**
   * Refreshes pinned entries from the current server library list, matched
   * by id. Entries absent from the list are kept unchanged.
   */
  syncWithAvailable: (available: ClientLibrary[]) => void;
};

const PinnedLibrariesContext = React.createContext<
  PinnedLibrariesState | undefined
>(undefined);

export const PinnedLibrariesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [pinnedLibraries, setPinnedLibraries] = React.useState<PinnedLibrary[]>(
    []
  );

  /*
   * Storage is read after mount rather than in the initial state so the
   * server and client first renders match (no hydration mismatch).
   */
  React.useEffect(() => {
    setPinnedLibraries(readPinnedLibraries());
  }, []);

  /*
   * The storage event fires only in other tabs, so refreshing from storage
   * here keeps this tab in sync with writes made elsewhere without looping
   * on its own writes. A null key means storage was cleared.
   */
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === PINNED_LIBRARIES_KEY || event.key === null) {
        setPinnedLibraries(readPinnedLibraries());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /*
   * Applies an updater to the current list and persists the result. Updaters
   * return the previous array unchanged when there is nothing to do, which
   * skips the write. The write is idempotent, so a re-invoked updater (e.g.
   * under StrictMode) is harmless.
   */
  const update = React.useCallback(
    (updater: (prev: PinnedLibrary[]) => PinnedLibrary[]) => {
      setPinnedLibraries(prev => {
        const next = updater(prev);
        if (next !== prev) writePinnedLibraries(next);
        return next;
      });
    },
    []
  );

  const pinLibrary = React.useCallback(
    (library: PinnableLibrary) => {
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
    [update]
  );

  const unpinLibrary = React.useCallback(
    (id: string) => update(prev => withoutPinned(prev, id)),
    [update]
  );

  const syncWithAvailable = React.useCallback(
    (available: ClientLibrary[]) => update(prev => syncPinned(prev, available)),
    [update]
  );

  const isPinned = React.useCallback(
    (id: string) => pinnedLibraries.some(lib => lib.id === id),
    [pinnedLibraries]
  );

  const value = React.useMemo(
    () => ({
      pinnedLibraries,
      pinLibrary,
      unpinLibrary,
      isPinned,
      syncWithAvailable
    }),
    [pinnedLibraries, pinLibrary, unpinLibrary, isPinned, syncWithAvailable]
  );

  return (
    <PinnedLibrariesContext.Provider value={value}>
      {children}
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
