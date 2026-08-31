import { describe, expect, test } from "@jest/globals";
import * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
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

beforeEach(() => {
  fetchMock.resetMocks();
});

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

  test("reads the logo from the auth document when pinning without one", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        links: [{ rel: "logo", href: "https://example.com/logo.png" }]
      })
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        authDocUrl: "https://cm.example.com/abclib/auth"
      })
    );

    await waitFor(() =>
      expect(result.current.pinnedLibraries[0]?.logoUrl).toBe(
        "https://example.com/logo.png"
      )
    );
    // The fetch goes straight to the auth document, not to our server.
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.host).toBe("cm.example.com");
    expect(url.pathname).toBe("/abclib/auth");

    const stored = readPinnedLibraries()[0];
    expect(stored.logoUrl).toBe("https://example.com/logo.png");
    // The auth document URL is used for the fetch only, never stored.
    expect(stored).not.toHaveProperty("authDocUrl");
  });

  test("does not fetch a logo when the pin already has one", () => {
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        logoUrl: "https://example.com/logo.png",
        authDocUrl: "https://cm.example.com/abclib/auth"
      })
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(readPinnedLibraries()[0].logoUrl).toBe(
      "https://example.com/logo.png"
    );
  });

  test("does not fetch a logo without an auth document URL", () => {
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() => result.current.pinLibrary(library));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.pinnedLibraries[0]).toMatchObject(library);
  });

  test("does not persist extra caller fields beyond the pinned shape", () => {
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        logoUrl: "https://example.com/logo.png",
        authDocUrl: "https://cm.example.com/abclib/auth",
        // Extra field a caller might pass along with an API list entry.
        ...({ description: "Serving Anytown." } as object)
      })
    );

    expect(readPinnedLibraries()[0]).toEqual({
      ...library,
      logoUrl: "https://example.com/logo.png",
      pinnedAt: expect.any(Number)
    });
  });

  test("does not resurrect an entry unpinned before the logo fetch resolves", async () => {
    let resolveFetch = (_body: string) => undefined as void;
    fetchMock.mockResponseOnce(
      () => new Promise<string>(resolve => (resolveFetch = resolve))
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        authDocUrl: "https://cm.example.com/abclib/auth"
      })
    );
    act(() => result.current.unpinLibrary(library.id));
    expect(readPinnedLibraries()).toEqual([]);

    await act(async () => {
      resolveFetch(
        JSON.stringify({
          links: [{ rel: "logo", href: "https://example.com/logo.png" }]
        })
      );
    });

    expect(result.current.pinnedLibraries).toEqual([]);
    expect(readPinnedLibraries()).toEqual([]);
  });

  test("keeps a logo set while the fetch was in flight", async () => {
    let resolveFetch = (_body: string) => undefined as void;
    fetchMock.mockResponseOnce(
      () => new Promise<string>(resolve => (resolveFetch = resolve))
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        authDocUrl: "https://cm.example.com/abclib/auth"
      })
    );
    // The server list supplies a logo before the auth document answers.
    act(() =>
      result.current.syncWithAvailable([
        {
          ...library,
          authDocUrl: "https://cm.example.com/abclib/auth",
          logoUrl: "https://s3.example.com/from-sync.png"
        }
      ])
    );

    await act(async () => {
      resolveFetch(
        JSON.stringify({
          links: [{ rel: "logo", href: "https://example.com/from-fetch.png" }]
        })
      );
    });

    expect(result.current.pinnedLibraries[0].logoUrl).toBe(
      "https://s3.example.com/from-sync.png"
    );
  });

  test("leaves the entry without a logo when the document has none", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ links: [] }));
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        authDocUrl: "https://cm.example.com/abclib/auth"
      })
    );
    await act(async () => undefined);

    expect(result.current.pinnedLibraries[0]).toMatchObject(library);
    expect(result.current.pinnedLibraries[0].logoUrl).toBeUndefined();
  });

  test("keeps the entry without a logo when the fetch fails", async () => {
    fetchMock.mockRejectOnce(new Error("network down"));
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });

    act(() =>
      result.current.pinLibrary({
        ...library,
        authDocUrl: "https://cm.example.com/abclib/auth"
      })
    );
    // Let the rejected fetch settle.
    await act(async () => undefined);

    expect(result.current.pinnedLibraries[0]).toMatchObject(library);
    expect(result.current.pinnedLibraries[0].logoUrl).toBeUndefined();
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

describe("cross-tab storage events", () => {
  function dispatchStorage(key: string | null) {
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key }));
    });
  }

  test("refreshes from storage when another tab writes the pinned key", () => {
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });
    expect(result.current.pinnedLibraries).toEqual([]);

    localStorage.setItem(
      PINNED_LIBRARIES_KEY,
      JSON.stringify([{ ...library, pinnedAt: 1000 }])
    );
    dispatchStorage(PINNED_LIBRARIES_KEY);

    expect(result.current.pinnedLibraries).toHaveLength(1);
  });

  test("refreshes when storage is cleared (null key)", () => {
    localStorage.setItem(
      PINNED_LIBRARIES_KEY,
      JSON.stringify([{ ...library, pinnedAt: 1000 }])
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });
    expect(result.current.pinnedLibraries).toHaveLength(1);

    localStorage.clear();
    dispatchStorage(null);

    expect(result.current.pinnedLibraries).toEqual([]);
  });

  test("ignores events for unrelated keys", () => {
    localStorage.setItem(
      PINNED_LIBRARIES_KEY,
      JSON.stringify([{ ...library, pinnedAt: 1000 }])
    );
    const { result } = renderHook(() => usePinnedLibraries(), { wrapper });
    const before = result.current.pinnedLibraries;

    dispatchStorage("SOME_OTHER_KEY");

    expect(result.current.pinnedLibraries).toBe(before);
  });
});
