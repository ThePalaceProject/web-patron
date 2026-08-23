import * as React from "react";
import { PinnedLibrary } from "interfaces";
import type { ClientLibrary } from "pages/api/libraries";
import {
  readPinnedLibraries,
  writePinnedLibraries,
  withPinned,
  withoutPinned,
  syncPinned
} from "utils/pinnedLibraries";

export type PinnedLibrariesState = {
  pinnedLibraries: PinnedLibrary[];
  pinLibrary: (library: Omit<PinnedLibrary, "pinnedAt">) => void;
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
    (library: Omit<PinnedLibrary, "pinnedAt">) =>
      update(prev => withPinned(prev, library)),
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
