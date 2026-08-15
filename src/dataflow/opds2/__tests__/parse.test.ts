import { describe, expect, test } from "@jest/globals";
import { feedToCollection, publicationToBook } from "dataflow/opds2/parse";
import {
  Opds2Feed,
  Opds2FeedSchema,
  Opds2Publication,
  Opds2PublicationSchema
} from "validation/opds2Catalog";
import * as fixtures from "test-utils/fixtures/opds2-catalog";

const { CATALOG_URL } = fixtures;

/**
 * Schema-asserting helpers: they both type the fixture for the mapper and
 * prove the fixture matches what the CM actually serializes.
 */
function asFeed(data: unknown): Opds2Feed {
  return Opds2FeedSchema.assert(data);
}
function asPublication(data: unknown): Opds2Publication {
  return Opds2PublicationSchema.assert(data);
}

describe("publicationToBook", () => {
  test("parses bibliographic metadata", () => {
    const book = publicationToBook(
      asPublication(fixtures.borrowablePublication),
      CATALOG_URL
    );
    expect(book.id).toBe("urn:isbn:9780000000001");
    expect(book.title).toBe("Borrowable Book");
    expect(book.authors).toEqual(["Test Author"]);
    expect(book.publisher).toBe("Test Publisher");
    expect(book.language).toBe("en");
    expect(book.published).toBe("2020-06-15");
    expect(book.summary).toBe("A <b>very</b> good book.");
    expect(book.audience).toBe("Adult");
    expect(book.categories).toEqual(["Fiction"]);
    expect(book.imageUrl).toBe("https://cm.example.com/covers/1-thumb.png");
    expect(book.url).toBe("https://cm.example.com/works/1");
    expect(book.format).toBe("ePub");
  });

  test("parses a borrowable book", () => {
    const book = publicationToBook(
      asPublication(fixtures.borrowablePublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "borrowable",
      borrowUrl: "https://cm.example.com/works/1/borrow",
      availability: { status: "available" },
      copies: { total: 5, available: 3 },
      holds: { total: 0, position: undefined }
    });
  });

  test("parses a reservable book", () => {
    const book = publicationToBook(
      asPublication(fixtures.reservablePublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "reservable",
      reserveUrl: "https://cm.example.com/works/2/borrow",
      copies: { total: 2, available: 0 }
    });
  });

  test("parses an on-hold (ready) book", () => {
    const book = publicationToBook(
      asPublication(fixtures.onHoldPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "on-hold",
      borrowUrl: "https://cm.example.com/works/3/borrow",
      availability: { until: "2026-02-01T00:00:00+00:00" }
    });
  });

  test("parses a reserved book with hold position and revoke url", () => {
    const book = publicationToBook(
      asPublication(fixtures.reservedPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "reserved",
      revokeUrl: "https://cm.example.com/loans/4/revoke",
      holds: { total: 10, position: 3 }
    });
  });

  test("parses an open access book as fulfillable", () => {
    const book = publicationToBook(
      asPublication(fixtures.openAccessPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "fulfillable",
      fulfillmentLinks: [
        {
          url: "https://cm.example.com/works/5/open-access.epub",
          contentType: "application/epub+zip",
          supportLevel: "show"
        }
      ],
      revokeUrl: null
    });
  });

  test("parses an open-access link with an indirection chain by its resolved format, not its wrapper type", () => {
    const book = publicationToBook(
      asPublication(fixtures.openAccessBearerTokenPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "fulfillable",
      fulfillmentLinks: [
        {
          url: "https://cm.example.com/works/12/fulfill",
          contentType: "application/pdf",
          indirectionType:
            "application/vnd.librarysimplified.bearer-token+json",
          supportLevel: "redirect"
        }
      ]
    });
  });

  test("parses an active loan as fulfillable with indirection", () => {
    const book = publicationToBook(
      asPublication(fixtures.loanedPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "fulfillable",
      fulfillmentLinks: [
        {
          url: "https://cm.example.com/loans/6/fulfill",
          contentType: "application/epub+zip",
          indirectionType: "application/vnd.adobe.adept+xml",
          supportLevel: "redirect-and-show"
        }
      ],
      revokeUrl: "https://cm.example.com/loans/6/revoke"
    });
  });

  test("parses a streaming loan, normalizing OPDS entry indirection", () => {
    const book = publicationToBook(
      asPublication(fixtures.streamingLoanedPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "fulfillable",
      fulfillmentLinks: [
        {
          url: "https://cm.example.com/loans/10/fulfill",
          contentType:
            'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"',
          indirectionType:
            "application/atom+xml;type=entry;profile=opds-catalog",
          supportLevel: "show"
        }
      ],
      revokeUrl: "https://cm.example.com/loans/10/revoke"
    });
  });

  test("treats a streaming-only format behind a borrow link as supported", () => {
    const book = publicationToBook(
      asPublication(fixtures.streamingBorrowablePublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      status: "borrowable",
      borrowUrl: "https://cm.example.com/works/11/borrow"
    });
  });

  test("parses an audiobook loan", () => {
    const book = publicationToBook(
      asPublication(fixtures.audiobookPublication),
      CATALOG_URL
    );
    expect(book).toMatchObject({
      format: "Audiobook",
      duration: 7620,
      narrators: ["First Narrator", "Second Narrator"],
      status: "fulfillable",
      fulfillmentLinks: [
        {
          url: "https://cm.example.com/loans/7/fulfill",
          contentType: "application/audiobook+json",
          indirectionType: undefined,
          supportLevel: "redirect"
        }
      ]
    });
  });

  test("parses a book with only unsupported formats as unsupported", () => {
    const book = publicationToBook(
      asPublication(fixtures.unsupportedPublication),
      CATALOG_URL
    );
    expect(book.status).toBe("unsupported");
  });

  test("accepts LanguageMap objects for title and contributor names", () => {
    const book = publicationToBook(
      asPublication({
        metadata: {
          identifier: "urn:x:1",
          title: { en: "English Title" },
          author: [{ name: { fr: "Auteur" } }, "Plain Author"]
        }
      }),
      CATALOG_URL
    );
    expect(book.title).toBe("English Title");
    expect(book.authors).toEqual(["Auteur", "Plain Author"]);
  });

  test("parses series name and position", () => {
    const book = publicationToBook(
      asPublication({
        metadata: {
          identifier: "urn:x:2",
          title: "In a Series",
          belongsTo: { series: { name: "Test Series", position: 2 } }
        }
      }),
      CATALOG_URL
    );
    expect(book.series).toEqual({ name: "Test Series", position: 2 });
  });

  test("falls back to the feed url when there is no alternate link", () => {
    const book = publicationToBook(
      asPublication({ metadata: { identifier: "urn:x:3", title: "No Links" } }),
      CATALOG_URL
    );
    expect(book.url).toBe(CATALOG_URL);
  });

  test("does not throw on malformed leaf values", () => {
    const book = publicationToBook(
      {
        metadata: {
          title: 42,
          author: { name: { weird: 7 } },
          belongsTo: "nope"
        },
        links: "not-an-array",
        images: [{ href: 12 }]
      } as unknown as Opds2Publication,
      CATALOG_URL
    );
    expect(book.title).toBe("");
    expect(book.status).toBe("unsupported");
    expect(book.url).toBe(CATALOG_URL);
  });
});

describe("feedToCollection", () => {
  test("parses a grouped feed into lanes", () => {
    const collection = feedToCollection(
      asFeed(fixtures.groupedFeed),
      CATALOG_URL
    );
    expect(collection.title).toBe("Test Library");
    expect(collection.books).toHaveLength(0);
    expect(collection.lanes).toHaveLength(2);
    expect(collection.lanes[0]).toMatchObject({
      title: "Popular Books",
      url: "https://cm.example.com/groups/popular"
    });
    expect(collection.lanes[0].books).toHaveLength(2);
    expect(collection.lanes[1].books).toHaveLength(2);
    expect(collection.searchDataUrl).toBe("https://cm.example.com/search");
  });

  test("parses a paginated feed with facets", () => {
    const collection = feedToCollection(
      asFeed(fixtures.paginatedFeed),
      "https://cm.example.com/catalog/all"
    );
    expect(collection.title).toBe("All Books");
    expect(collection.id).toBe("https://cm.example.com/catalog/all");
    expect(collection.books).toHaveLength(2);
    expect(collection.nextPageUrl).toBe(
      "https://cm.example.com/catalog/all?page=2"
    );
    expect(collection.parentLink?.url).toBe(CATALOG_URL);
    expect(collection.catalogRootLink?.url).toBe(CATALOG_URL);
    expect(collection.facetGroups).toEqual([
      {
        label: "Sort by",
        facets: [
          {
            label: "Author",
            href: "https://cm.example.com/catalog/all?order=author",
            active: true
          },
          {
            label: "Title",
            href: "https://cm.example.com/catalog/all?order=title",
            active: false
          }
        ]
      }
    ]);
  });

  test("parses a navigation feed", () => {
    const collection = feedToCollection(
      asFeed(fixtures.navigationFeed),
      CATALOG_URL
    );
    expect(collection.books).toHaveLength(0);
    expect(collection.navigationLinks).toEqual([
      {
        id: "https://cm.example.com/catalog/fiction",
        text: "Fiction",
        url: "https://cm.example.com/catalog/fiction"
      },
      {
        id: "https://cm.example.com/catalog/nonfiction",
        text: "Nonfiction",
        url: "https://cm.example.com/catalog/nonfiction"
      }
    ]);
  });

  test("drops publications with no acquisition links", () => {
    const collection = feedToCollection(
      asFeed(fixtures.loansFeed),
      "https://cm.example.com/loans"
    );
    expect(collection.books.map(book => book.title)).toEqual([
      "Loaned Book",
      "Reserved Book",
      "Audiobook on Loan"
    ]);
  });

  test("dedupes books by id", () => {
    const collection = feedToCollection(
      asFeed({
        metadata: { title: "Dupes" },
        links: [],
        publications: [
          fixtures.borrowablePublication,
          fixtures.borrowablePublication
        ]
      }),
      CATALOG_URL
    );
    expect(collection.books).toHaveLength(1);
  });

  test("resolves relative urls against the feed url", () => {
    const collection = feedToCollection(
      asFeed({
        metadata: { title: "Relative" },
        links: [{ href: "/next-page", rel: "next" }],
        publications: []
      }),
      CATALOG_URL
    );
    expect(collection.nextPageUrl).toBe("https://cm.example.com/next-page");
  });

  test("does not throw when publications is not an array", () => {
    const collection = feedToCollection(
      {
        metadata: { title: "Malformed" },
        links: [],
        publications: "not-an-array"
      } as unknown as Opds2Feed,
      CATALOG_URL
    );
    expect(collection.books).toEqual([]);
  });

  test("does not throw when a group's publications is not an array", () => {
    const collection = feedToCollection(
      {
        metadata: { title: "Malformed Group" },
        links: [],
        groups: [
          {
            metadata: { title: "Broken Group" },
            links: [],
            publications: "not-an-array"
          }
        ]
      } as unknown as Opds2Feed,
      CATALOG_URL
    );
    expect(collection.lanes).toEqual([]);
  });

  test("maps an empty document to an empty collection", () => {
    const collection = feedToCollection({} as Opds2Feed, CATALOG_URL);
    expect(collection).toMatchObject({
      id: CATALOG_URL,
      url: CATALOG_URL,
      title: "",
      lanes: [],
      books: [],
      navigationLinks: [],
      facetGroups: [],
      searchDataUrl: null
    });
  });
});
