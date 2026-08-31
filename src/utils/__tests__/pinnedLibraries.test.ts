import { describe, expect, test } from "@jest/globals";
import { PinnedLibrary } from "interfaces";
import {
  PINNED_LIBRARIES_KEY,
  readPinnedLibraries,
  writePinnedLibraries,
  withPinned,
  withoutPinned,
  syncPinned
} from "utils/pinnedLibraries";

const pinnedLib: PinnedLibrary = {
  id: "urn:uuid:abc",
  slug: "abclib",
  title: "ABC Library",
  pinnedAt: 1000
};

describe("readPinnedLibraries", () => {
  test("returns [] when nothing is stored", () => {
    expect(readPinnedLibraries()).toEqual([]);
  });

  test("returns [] for malformed JSON", () => {
    localStorage.setItem(PINNED_LIBRARIES_KEY, "{not json");
    expect(readPinnedLibraries()).toEqual([]);
  });

  test("returns [] when the stored value is not an array", () => {
    localStorage.setItem(PINNED_LIBRARIES_KEY, JSON.stringify({ a: 1 }));
    expect(readPinnedLibraries()).toEqual([]);
  });

  test("drops entries missing required fields", () => {
    localStorage.setItem(
      PINNED_LIBRARIES_KEY,
      JSON.stringify([pinnedLib, { id: "no-other-fields" }, null, 42])
    );
    expect(readPinnedLibraries()).toEqual([pinnedLib]);
  });

  test("round-trips through writePinnedLibraries", () => {
    expect(writePinnedLibraries([pinnedLib])).toBe(true);
    expect(readPinnedLibraries()).toEqual([pinnedLib]);
  });
});

describe("withPinned", () => {
  test("appends a new entry with a pinnedAt timestamp", () => {
    const { pinnedAt: _, ...unpinned } = pinnedLib;
    const result = withPinned([], unpinned);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(unpinned);
    expect(typeof result[0].pinnedAt).toBe("number");
  });

  test("re-pinning updates fields but keeps the original pinnedAt", () => {
    const result = withPinned([pinnedLib], {
      id: pinnedLib.id,
      slug: "newslug",
      title: "New Title"
    });
    expect(result).toEqual([
      { ...pinnedLib, slug: "newslug", title: "New Title" }
    ]);
  });
});

describe("withoutPinned", () => {
  test("removes the entry with the given id", () => {
    expect(withoutPinned([pinnedLib], pinnedLib.id)).toEqual([]);
  });

  test("returns the original array when the id is not pinned", () => {
    const libraries = [pinnedLib];
    expect(withoutPinned(libraries, "unknown")).toBe(libraries);
  });
});

describe("syncPinned", () => {
  test("refreshes slug and title from the available list", () => {
    const result = syncPinned(
      [pinnedLib],
      [
        {
          id: pinnedLib.id,
          slug: "renamed",
          title: "Renamed Library",
          authDocUrl: "https://example.com/renamed/auth"
        }
      ]
    );
    expect(result).toEqual([
      { ...pinnedLib, slug: "renamed", title: "Renamed Library" }
    ]);
  });

  test("keeps entries absent from the available list", () => {
    const pinned = [pinnedLib];
    const result = syncPinned(pinned, []);
    expect(result).toBe(pinned);
  });

  test("backfills a missing logo from the available list", () => {
    const result = syncPinned(
      [pinnedLib],
      [
        {
          id: pinnedLib.id,
          slug: pinnedLib.slug,
          title: pinnedLib.title,
          authDocUrl: "https://example.com/abclib/auth",
          logoUrl: "https://s3.example.com/logo.png"
        }
      ]
    );
    expect(result).toEqual([
      { ...pinnedLib, logoUrl: "https://s3.example.com/logo.png" }
    ]);
  });

  test("keeps a stored logo over the available list's logo", () => {
    const pinned = [
      { ...pinnedLib, logoUrl: "https://example.com/stored-logo.png" }
    ];
    const result = syncPinned(pinned, [
      {
        id: pinnedLib.id,
        slug: pinnedLib.slug,
        title: pinnedLib.title,
        authDocUrl: "https://example.com/abclib/auth",
        logoUrl: "https://s3.example.com/other-logo.png"
      }
    ]);
    expect(result).toBe(pinned);
  });

  test("returns the original array when nothing changed", () => {
    const pinned = [pinnedLib];
    const result = syncPinned(pinned, [
      {
        id: pinnedLib.id,
        slug: pinnedLib.slug,
        title: pinnedLib.title,
        authDocUrl: "https://example.com/abc/auth"
      }
    ]);
    expect(result).toBe(pinned);
  });
});
