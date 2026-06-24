/**
 * @jest-environment node
 *
 * Tests for RegistryFeedSchema runtime validation.
 * Run under jest.config.node.js.
 */

import { type } from "arktype";
import { RegistryFeedSchema } from "validation/registryFeed";

function minimal() {
  return {
    metadata: { title: "Test Registry" },
    links: []
  };
}

function catalogEntry(id: string, title: string) {
  return {
    metadata: { id, title, updated: new Date().toISOString(), description: "" },
    links: [
      {
        href: `https://${id}.example.com/auth`,
        type: "application/vnd.opds.authentication.v1.0+json"
      }
    ]
  };
}

describe("RegistryFeedSchema", () => {
  it("accepts a minimal valid registry feed", () => {
    const result = RegistryFeedSchema(minimal());
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts a feed with catalogs", () => {
    const feed = {
      ...minimal(),
      catalogs: [
        catalogEntry("urn:uuid:abc", "Library A"),
        catalogEntry("urn:uuid:def", "Library B")
      ]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts a feed with facets", () => {
    const feed = {
      ...minimal(),
      facets: [
        {
          metadata: { title: "Sort" },
          links: [{ href: "/sort?order=modified", rel: "self" }]
        }
      ]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts a feed with pagination links", () => {
    const feed = {
      metadata: { title: "Registry", adobe_vendor_id: "vendor" }, // eslint-disable-line camelcase -- from external API
      links: [{ href: "/page2", rel: "next", type: "application/opds+json" }],
      catalogs: [catalogEntry("urn:uuid:a", "A")]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
  });

  it("preserves extra fields on catalog entries", () => {
    const feed = {
      ...minimal(),
      catalogs: [
        {
          ...catalogEntry("urn:uuid:x", "X"),
          navigation: [{ title: "Nav", href: "/nav" }]
        }
      ]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
    expect((result as any).catalogs[0].navigation).toBeDefined();
  });

  it("rejects when metadata is missing", () => {
    const result = RegistryFeedSchema({ links: [] });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("metadata");
  });

  it("rejects when metadata.title is missing", () => {
    const result = RegistryFeedSchema({ metadata: {}, links: [] });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("title");
  });

  it("rejects when links is missing", () => {
    const result = RegistryFeedSchema({ metadata: { title: "X" } });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("links");
  });

  it("rejects when a catalog entry is missing metadata", () => {
    const result = RegistryFeedSchema({
      ...minimal(),
      catalogs: [{ links: [] }]
    });
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects when a catalog entry metadata is missing required fields", () => {
    const result = RegistryFeedSchema({
      ...minimal(),
      catalogs: [{ metadata: { title: "X" }, links: [] }]
    });
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects when a catalog entry is missing links", () => {
    const result = RegistryFeedSchema({
      ...minimal(),
      catalogs: [
        {
          metadata: {
            id: "x",
            title: "X",
            updated: "2024-01-01T00:00:00Z"
          }
        }
      ]
    });
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects a completely wrong response", () => {
    const result = RegistryFeedSchema("not an object");
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects null", () => {
    const result = RegistryFeedSchema(null);
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = RegistryFeedSchema({});
    expect(result instanceof type.errors).toBe(true);
  });
});
