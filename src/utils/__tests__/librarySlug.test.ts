import {
  computeSlug,
  getRegistryLibraryShortName,
  validateSlug
} from "../librarySlug";
import type { OPDS2 } from "interfaces";

function makeCatalog(
  id: string,
  links: OPDS2.CatalogEntry["links"] = []
): OPDS2.CatalogEntry {
  return {
    metadata: { id, title: "Test Library", updated: "", description: "" },
    links
  };
}

function catalogLink(href: string): OPDS2.Link {
  return {
    rel: "http://opds-spec.org/catalog",
    type: "application/atom+xml;profile=opds-catalog;kind=acquisition",
    href
  } as OPDS2.Link;
}

function authDocLink(href: string): OPDS2.Link {
  return {
    type: "application/vnd.opds.authentication.v1.0+json",
    href
  } as OPDS2.Link;
}

// ---------------------------------------------------------------------------
// validateSlug
// ---------------------------------------------------------------------------

describe("validateSlug", () => {
  it("accepts alphanumeric slugs", () => {
    expect(validateSlug("mylib")).toBe(true);
    expect(validateSlug("MyLib123")).toBe(true);
  });

  it("accepts slugs with hyphens and underscores", () => {
    expect(validateSlug("my-lib")).toBe(true);
    expect(validateSlug("my_lib")).toBe(true);
  });

  it("accepts slugs containing colons", () => {
    expect(validateSlug("urn:uuid:abc")).toBe(true);
  });

  it("accepts slugs containing slashes", () => {
    expect(validateSlug("a/b")).toBe(true);
  });

  it("accepts slugs containing spaces", () => {
    expect(validateSlug("my lib")).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(validateSlug("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeSlug
// ---------------------------------------------------------------------------

describe("getRegistryLibraryShortName", () => {
  describe("catalog root link (primary source)", () => {
    it("returns the first path component of the catalog root link href", () => {
      const entry = makeCatalog("urn:uuid:abc", [
        catalogLink("https://example.com/XYZZY/"),
        authDocLink("https://example.com/XYZZY/authentication_document")
      ]);
      expect(getRegistryLibraryShortName(entry)).toBe("XYZZY");
    });

    it("prefers the catalog root link over the auth document link", () => {
      const entry = makeCatalog("id", [
        authDocLink("https://example.com/XYZZY-auth/auth"),
        catalogLink("https://example.com/XYZZY-catalog/")
      ]);
      expect(getRegistryLibraryShortName(entry)).toBe("XYZZY-catalog");
    });

    it("strips subsequent path segments, keeping only the first component", () => {
      const entry = makeCatalog("id", [
        catalogLink("https://example.com/XYZZY/feeds/loans")
      ]);
      expect(getRegistryLibraryShortName(entry)).toBe("XYZZY");
    });
  });

  describe("auth document link (secondary source)", () => {
    it("matches by type when no rel is present", () => {
      const entry = makeCatalog("urn:uuid:abc", [
        authDocLink("https://example.com/XYZZY/authentication_document")
      ]);
      expect(getRegistryLibraryShortName(entry)).toBe("XYZZY");
    });

    it("matches by rel when present", () => {
      const entry = makeCatalog("urn:uuid:abc", [
        {
          rel: "http://opds-spec.org/auth/document",
          href: "https://example.com/XYZZY/authentication_document"
        } as OPDS2.Link
      ]);
      expect(getRegistryLibraryShortName(entry)).toBe("XYZZY");
    });

    it("falls back to auth doc link when catalog link has no path component", () => {
      const entry = makeCatalog("id", [
        catalogLink("https://example.com/"),
        authDocLink("https://example.com/XYZZY/auth")
      ]);
      expect(getRegistryLibraryShortName(entry)).toBe("XYZZY");
    });
  });

  it("returns null when no links are present", () => {
    expect(
      getRegistryLibraryShortName(makeCatalog("urn:uuid:abc123"))
    ).toBeNull();
  });

  it("returns null when both links have no meaningful path component", () => {
    const entry = makeCatalog("my-library-id", [
      catalogLink("https://example.com/"),
      authDocLink("https://example.com/")
    ]);
    expect(getRegistryLibraryShortName(entry)).toBeNull();
  });

  it("returns null when no links are of the recognized types", () => {
    const entry = makeCatalog("my-id", [
      {
        rel: "self",
        type: "application/opds+json",
        href: "https://x.com/foo/"
      } as OPDS2.Link
    ]);
    expect(getRegistryLibraryShortName(entry)).toBeNull();
  });

  it("returns null when the link href is not an absolute URL", () => {
    const entry = makeCatalog("id", [authDocLink("/relative/path")]);
    expect(getRegistryLibraryShortName(entry)).toBeNull();
  });
});

describe("computeSlug", () => {
  it("returns the short name when available", () => {
    const entry = makeCatalog("urn:uuid:abc", [
      catalogLink("https://example.com/XYZZY/")
    ]);
    expect(computeSlug(entry)).toBe("XYZZY");
  });

  it("falls back to metadata.id when no short name can be derived", () => {
    expect(computeSlug(makeCatalog("urn:uuid:abc123"))).toBe("urn:uuid:abc123");
    expect(computeSlug(makeCatalog("my-library"))).toBe("my-library");
  });

  it("produces a slug that passes validateSlug", () => {
    const entry = makeCatalog("urn:uuid:3f0b05a0-4b6f-11ee-be56-0242ac120002", [
      catalogLink("https://example.com/XYZZY/")
    ]);
    expect(validateSlug(computeSlug(entry))).toBe(true);
  });
});
