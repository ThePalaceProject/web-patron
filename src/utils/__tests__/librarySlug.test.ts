import { computeSlug, validateSlug } from "../librarySlug";
import type { OPDS2 } from "interfaces";

function makeCatalog(id: string): OPDS2.CatalogEntry {
  return {
    metadata: { id, title: "Test Library", updated: "", description: "" },
    links: []
  };
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

  it("rejects slugs containing colons", () => {
    expect(validateSlug("urn:uuid:abc")).toBe(false);
  });

  it("rejects slugs containing slashes", () => {
    expect(validateSlug("a/b")).toBe(false);
  });

  it("rejects slugs containing spaces", () => {
    expect(validateSlug("my lib")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(validateSlug("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeSlug
// ---------------------------------------------------------------------------

describe("computeSlug", () => {
  it("strips 'urn:' prefix and replaces remaining colons with dashes", () => {
    expect(computeSlug(makeCatalog("urn:uuid:abc123"))).toBe("uuid-abc123");
  });

  it("handles a realistic UUID URN", () => {
    const id = "urn:uuid:3f0b05a0-4b6f-11ee-be56-0242ac120002";
    expect(computeSlug(makeCatalog(id))).toBe(
      "uuid-3f0b05a0-4b6f-11ee-be56-0242ac120002"
    );
  });

  it("handles URNs with multiple colon-separated segments", () => {
    expect(computeSlug(makeCatalog("urn:isbn:0451450523"))).toBe(
      "isbn-0451450523"
    );
  });

  it("returns non-URN ids unchanged", () => {
    expect(computeSlug(makeCatalog("my-library"))).toBe("my-library");
    expect(computeSlug(makeCatalog("library123"))).toBe("library123");
  });

  it("produces a slug that passes validateSlug for standard UUID URNs", () => {
    const slug = computeSlug(
      makeCatalog("urn:uuid:3f0b05a0-4b6f-11ee-be56-0242ac120002")
    );
    expect(validateSlug(slug)).toBe(true);
  });
});
