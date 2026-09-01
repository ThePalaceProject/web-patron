import { describe, expect, test } from "@jest/globals";
import * as React from "react";
import { act, renderHook } from "@testing-library/react";
import {
  PinnedLibrariesProvider,
  usePinnedLibraries
} from "../PinnedLibrariesContext";
import {
  PINNED_LIBRARIES_KEY,
  readPinnedLibraries
} from "utils/pinnedLibraries";
import { PinnedLibrary } from "interfaces";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PinnedLibrariesProvider>{children}</PinnedLibrariesProvider>
);

const library = {
  id: "urn:uuid:abc",
  slug: "abclib",
  title: "ABC Library"
};

describe("usePinnedLibraries", () => {
  test("throws when used outside the provider", () => {
    expect(() => renderHook(() => usePinnedLibraries())).toThrow(
      "usePinnedLibraries must be used within a PinnedLibrariesProvider"
    );
  });

  test("loads pinned libraries from localStorage on mount", () => {
    const stored: PinnedLibrary = { ...library, pinnedAt: 1000 };
    localStorage.setItem(PINNED_LIBRARIES_KEY, JSON.stringify([stored]));

    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });
    expect(result.current.pinnedLibraries).toEqual([stored]);
    expect(result.current.isPinned(library.id)).toBe(true);
  });

  test("pinLibrary updates state and persists", () => {
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });
    expect(result.current.isPinned(library.id)).toBe(false);

    act(() => result.current.pinLibrary(library));

    expect(result.current.pinnedLibraries[0]).toMatchObject(library);
    expect(result.current.isPinned(library.id)).toBe(true);
    expect(readPinnedLibraries()[0]).toMatchObject(library);
  });

  test("unpinLibrary updates state and persists", () => {
    localStorage.setItem(
      PINNED_LIBRARIES_KEY,
      JSON.stringify([{ ...library, pinnedAt: 1000 }])
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() => result.current.unpinLibrary(library.id));

    expect(result.current.pinnedLibraries).toEqual([]);
    expect(result.current.isPinned(library.id)).toBe(false);
    expect(readPinnedLibraries()).toEqual([]);
  });

  test("syncWithAvailable refreshes entries and persists", () => {
    localStorage.setItem(
      PINNED_LIBRARIES_KEY,
      JSON.stringify([{ ...library, pinnedAt: 1000 }])
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.syncWithAvailable([
        {
          ...library,
          slug: "renamed",
          title: "Renamed Library",
          authDocUrl: "https://example.com/abc/auth"
        }
      ])
    );

    expect(result.current.pinnedLibraries).toEqual([
      { ...library, slug: "renamed", title: "Renamed Library", pinnedAt: 1000 }
    ]);
    expect(readPinnedLibraries()[0].slug).toBe("renamed");
  });
});
