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

describe("computeSlug", () => {
  it("returns URN ids unchanged", () => {
    expect(computeSlug(makeCatalog("urn:uuid:abc123"))).toBe("urn:uuid:abc123");
    expect(computeSlug(makeCatalog("urn:isbn:0451450523"))).toBe(
      "urn:isbn:0451450523"
    );
    expect(
      computeSlug(makeCatalog("urn:uuid:3f0b05a0-4b6f-11ee-be56-0242ac120002"))
    ).toBe("urn:uuid:3f0b05a0-4b6f-11ee-be56-0242ac120002");
  });

  it("returns non-URN ids unchanged", () => {
    expect(computeSlug(makeCatalog("my-library"))).toBe("my-library");
    expect(computeSlug(makeCatalog("library123"))).toBe("library123");
  });

  it("produces a slug that passes validateSlug", () => {
    const slug = computeSlug(
      makeCatalog("urn:uuid:3f0b05a0-4b6f-11ee-be56-0242ac120002")
    );
    expect(validateSlug(slug)).toBe(true);
  });
});
