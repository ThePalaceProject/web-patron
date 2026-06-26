/* eslint-disable camelcase */
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
    metadata: { title: "Test Registry", adobe_vendor_id: null }, // eslint-disable-line camelcase -- from external API
    links: []
  };
}

function catalogEntry(id: string, title: string) {
  return {
    metadata: {
      id,
      title,
      updated: new Date().toISOString(),
      modified: new Date().toISOString(), // from external API
      description: ""
    },
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

  it("accepts a feed with facets including @type and properties", () => {
    const feed = {
      ...minimal(),
      facets: [
        {
          metadata: {
            title: "Sort by",
            "@type": "http://palaceproject.io/terms/rel/sort",
            "http://palaceproject.io/terms/facet/param": "order"
          },
          links: [
            {
              href: "/libraries?order=modified",
              title: "Most recently modified first",
              type: "application/opds+json",
              rel: "self",
              properties: {
                "http://palaceproject.io/terms/facet/value": "modified",
                "http://palaceproject.io/terms/properties/default": true,
                "http://palaceproject.io/terms/facet/group": "modified"
              }
            }
          ]
        }
      ]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts a paginated feed with numberOfItems", () => {
    const feed = {
      metadata: {
        title: "Libraries",
        adobe_vendor_id: "VENDORID",
        numberOfItems: 42
      }, // eslint-disable-line camelcase -- from external API
      links: [
        { href: "/page1", rel: "first", type: "application/opds+json" },
        { href: "/page2", rel: "next", type: "application/opds+json" }
      ],
      catalogs: [catalogEntry("urn:uuid:a", "A")]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts catalog entries with images", () => {
    const feed = {
      ...minimal(),
      catalogs: [
        {
          ...catalogEntry("urn:uuid:x", "X"),
          images: [
            {
              href: "https://example.com/logo.png",
              rel: "http://opds-spec.org/image/thumbnail",
              type: "image/png"
            }
          ]
        }
      ]
    };
    const result = RegistryFeedSchema(feed);
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts links with properties (hyperlink validation status)", () => {
    const feed = {
      ...minimal(),
      catalogs: [
        {
          metadata: {
            id: "urn:uuid:a",
            title: "A",
            updated: "2024-01-01T00:00:00Z",
            modified: "2024-01-01T00:00:00Z"
          },
          links: [
            {
              href: "https://example.com/auth",
              type: "application/vnd.opds.authentication.v1.0+json",
              rel: "http://opds-spec.org/auth/document"
            },
            {
              href: "mailto:help@example.com",
              rel: "help",
              properties: {
                "http://librarysimplified.org/rel/registry/validation-status":
                  "confirmed"
              }
            }
          ]
        }
      ]
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
            updated: "2024-01-01T00:00:00Z",
            modified: "2024-01-01T00:00:00Z"
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
