/**
 * OPDS 2 catalog fixtures shaped like the output of the Palace Circulation
 * Manager's OPDS2Serializer (palace-opds Pydantic models serialized with
 * by_alias / exclude_unset / exclude_none, so optional fields are simply
 * absent).
 */

export const CATALOG_URL = "https://cm.example.com/catalog";

const OPDS2_FEED_TYPE = "application/opds+json";
const OPDS2_PUBLICATION_TYPE = "application/opds-publication+json";
const ADOBE_TYPE = "application/vnd.adobe.adept+xml";
const EPUB_TYPE = "application/epub+zip";
const STREAMING_TYPE =
  'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"';
const BEARER_TOKEN_TYPE = "application/vnd.librarysimplified.bearer-token+json";
const PDF_TYPE = "application/pdf";

function makePublication(
  id: number,
  title: string,
  acquisitionLinks: unknown[],
  metadataOverrides: Record<string, unknown> = {}
) {
  return {
    metadata: {
      "@type": "http://schema.org/Book",
      identifier: `urn:isbn:978000000000${id}`,
      title,
      language: "en",
      modified: "2026-01-02T03:04:05+00:00",
      published: "2020-06-15",
      description: "A <b>very</b> good book.",
      author: { name: "Test Author" },
      publisher: { name: "Test Publisher" },
      subject: [
        {
          name: "Adult",
          scheme: "http://schema.org/audience",
          code: "Adult"
        },
        {
          name: "Fiction",
          scheme: "http://librarysimplified.org/terms/fiction/"
        }
      ],
      ...metadataOverrides
    },
    images: [
      {
        href: `https://cm.example.com/covers/${id}-thumb.png`,
        rel: "http://opds-spec.org/image/thumbnail",
        type: "image/png"
      },
      {
        href: `https://cm.example.com/covers/${id}.png`,
        rel: "http://opds-spec.org/image",
        type: "image/png"
      }
    ],
    links: [
      {
        href: `https://cm.example.com/works/${id}`,
        rel: "alternate",
        type: OPDS2_PUBLICATION_TYPE
      },
      ...acquisitionLinks
    ]
  };
}

export const borrowablePublication = makePublication(1, "Borrowable Book", [
  {
    href: "https://cm.example.com/works/1/borrow",
    rel: "http://opds-spec.org/acquisition/borrow",
    type: OPDS2_PUBLICATION_TYPE,
    properties: {
      availability: { state: "available" },
      holds: { total: 0 },
      copies: { total: 5, available: 3 },
      indirectAcquisition: [{ type: ADOBE_TYPE, child: [{ type: EPUB_TYPE }] }]
    }
  }
]);

export const reservablePublication = makePublication(2, "Reservable Book", [
  {
    href: "https://cm.example.com/works/2/borrow",
    rel: "http://opds-spec.org/acquisition/borrow",
    type: OPDS2_PUBLICATION_TYPE,
    properties: {
      availability: { state: "unavailable" },
      holds: { total: 4 },
      copies: { total: 2, available: 0 },
      indirectAcquisition: [{ type: ADOBE_TYPE, child: [{ type: EPUB_TYPE }] }]
    }
  }
]);

export const onHoldPublication = makePublication(3, "Ready Hold Book", [
  {
    href: "https://cm.example.com/works/3/borrow",
    rel: "http://opds-spec.org/acquisition/borrow",
    type: OPDS2_PUBLICATION_TYPE,
    properties: {
      availability: {
        state: "ready",
        until: "2026-02-01T00:00:00+00:00"
      },
      indirectAcquisition: [{ type: ADOBE_TYPE, child: [{ type: EPUB_TYPE }] }]
    }
  },
  {
    href: "https://cm.example.com/loans/3/revoke",
    rel: "http://librarysimplified.org/terms/rel/revoke"
  }
]);

export const reservedPublication = makePublication(4, "Reserved Book", [
  {
    href: "https://cm.example.com/works/4/borrow",
    rel: "http://opds-spec.org/acquisition/borrow",
    type: OPDS2_PUBLICATION_TYPE,
    properties: {
      availability: { state: "reserved" },
      holds: { total: 10, position: 3 },
      actions: { cancellable: true },
      indirectAcquisition: [{ type: ADOBE_TYPE, child: [{ type: EPUB_TYPE }] }]
    }
  },
  {
    href: "https://cm.example.com/loans/4/revoke",
    rel: "http://librarysimplified.org/terms/rel/revoke"
  }
]);

export const openAccessPublication = makePublication(5, "Open Access Book", [
  {
    href: "https://cm.example.com/works/5/open-access.epub",
    rel: "http://opds-spec.org/acquisition/open-access",
    type: EPUB_TYPE
  }
]);

/**
 * An anonymous direct-fulfillment link: the CM serializes these with the
 * open-access rel even though the format is wrapped in indirection (here, a
 * bearer-token exchange), per LibraryAnnotator.acquisition_links.
 */
export const openAccessBearerTokenPublication = makePublication(
  12,
  "Open Access Bearer Token Book",
  [
    {
      href: "https://cm.example.com/works/12/fulfill",
      rel: "http://opds-spec.org/acquisition/open-access",
      type: BEARER_TOKEN_TYPE,
      properties: {
        indirectAcquisition: [{ type: PDF_TYPE }]
      }
    }
  ]
);

/** An active loan: fulfill link with an indirect chain, plus a revoke link. */
export const loanedPublication = makePublication(6, "Loaned Book", [
  {
    href: "https://cm.example.com/loans/6/fulfill",
    rel: "http://opds-spec.org/acquisition",
    type: ADOBE_TYPE,
    properties: {
      availability: {
        state: "ready",
        since: "2026-01-01T00:00:00+00:00",
        until: "2026-01-22T00:00:00+00:00"
      },
      indirectAcquisition: [{ type: EPUB_TYPE }]
    }
  },
  {
    href: "https://cm.example.com/loans/6/revoke",
    rel: "http://librarysimplified.org/terms/rel/revoke"
  }
]);

/**
 * An active "Read Online" loan: a streaming link behind OPDS entry
 * indirection, which the CM types as the OPDS 2 publication media type.
 */
export const streamingLoanedPublication = makePublication(
  10,
  "Streaming Loaned Book",
  [
    {
      href: "https://cm.example.com/loans/10/fulfill",
      rel: "http://opds-spec.org/acquisition",
      type: OPDS2_PUBLICATION_TYPE,
      properties: {
        availability: { state: "ready" },
        indirectAcquisition: [{ type: STREAMING_TYPE }]
      }
    },
    {
      href: "https://cm.example.com/loans/10/revoke",
      rel: "http://librarysimplified.org/terms/rel/revoke"
    }
  ]
);

/** A borrowable book whose only format is streaming. */
export const streamingBorrowablePublication = makePublication(
  11,
  "Streaming Borrowable Book",
  [
    {
      href: "https://cm.example.com/works/11/borrow",
      rel: "http://opds-spec.org/acquisition/borrow",
      type: OPDS2_PUBLICATION_TYPE,
      properties: {
        availability: { state: "available" },
        indirectAcquisition: [
          { type: OPDS2_PUBLICATION_TYPE, child: [{ type: STREAMING_TYPE }] }
        ]
      }
    }
  ]
);

/** An audiobook loan with Palace time-tracking metadata. */
export const audiobookPublication = makePublication(
  7,
  "Audiobook on Loan",
  [
    {
      href: "https://cm.example.com/loans/7/fulfill",
      rel: "http://opds-spec.org/acquisition",
      type: "application/audiobook+json"
    },
    {
      href: "https://cm.example.com/loans/7/revoke",
      rel: "http://librarysimplified.org/terms/rel/revoke"
    }
  ],
  {
    "@type": "http://schema.org/Audiobook",
    duration: 7620,
    narrator: [{ name: "First Narrator" }, "Second Narrator"],
    "http://palaceproject.io/terms/timeTracking": true
  }
);

/** Only unsupported formats behind the borrow link. */
export const unsupportedPublication = makePublication(8, "Unsupported Book", [
  {
    href: "https://cm.example.com/works/8/borrow",
    rel: "http://opds-spec.org/acquisition/borrow",
    type: OPDS2_PUBLICATION_TYPE,
    properties: {
      availability: { state: "available" },
      indirectAcquisition: [
        {
          type: "application/x-unknown-drm",
          child: [{ type: "application/x-unknown-format" }]
        }
      ]
    }
  }
]);

/** A loan for a title removed from the collection: no acquisition links. */
export const noAcquisitionPublication = {
  metadata: {
    "@type": "http://schema.org/Book",
    identifier: "urn:isbn:9780000000009",
    title: "Removed Book"
  },
  images: [],
  links: [
    {
      href: "https://cm.example.com/works/9",
      rel: "alternate",
      type: OPDS2_PUBLICATION_TYPE
    }
  ]
};

const searchLink = {
  href: "https://cm.example.com/search",
  rel: "search",
  type: "application/opensearchdescription+xml"
};

const startLink = {
  href: CATALOG_URL,
  rel: "start",
  type: OPDS2_FEED_TYPE
};

export const groupedFeed = {
  metadata: { title: "Test Library" },
  links: [
    { href: CATALOG_URL, rel: "self", type: OPDS2_FEED_TYPE },
    searchLink,
    startLink
  ],
  groups: [
    {
      metadata: { title: "Popular Books" },
      links: [
        {
          href: "https://cm.example.com/groups/popular",
          rel: "self",
          type: OPDS2_FEED_TYPE
        }
      ],
      publications: [borrowablePublication, reservablePublication]
    },
    {
      metadata: { title: "New Arrivals" },
      links: [
        {
          href: "https://cm.example.com/groups/new",
          rel: "self",
          type: OPDS2_FEED_TYPE
        }
      ],
      publications: [openAccessPublication, borrowablePublication]
    }
  ]
};

export const paginatedFeed = {
  metadata: {
    title: "All Books",
    itemsPerPage: 2,
    currentPage: 1,
    numberOfItems: 4
  },
  links: [
    {
      href: "https://cm.example.com/catalog/all",
      rel: "self",
      type: OPDS2_FEED_TYPE
    },
    {
      href: "https://cm.example.com/catalog/all?page=2",
      rel: "next",
      type: OPDS2_FEED_TYPE
    },
    { href: CATALOG_URL, rel: "up", type: OPDS2_FEED_TYPE },
    searchLink,
    startLink
  ],
  publications: [borrowablePublication, openAccessPublication],
  facets: [
    {
      metadata: {
        title: "Sort by",
        "@type": "http://palaceproject.io/terms/rel/sort"
      },
      links: [
        {
          href: "https://cm.example.com/catalog/all?order=author",
          title: "Author",
          rel: "self",
          type: OPDS2_FEED_TYPE,
          properties: {
            "http://palaceproject.io/terms/properties/default": true
          }
        },
        {
          href: "https://cm.example.com/catalog/all?order=title",
          title: "Title",
          type: OPDS2_FEED_TYPE
        }
      ]
    }
  ]
};

export const navigationFeed = {
  metadata: { title: "Browse" },
  links: [
    {
      href: "https://cm.example.com/catalog/nav",
      rel: "self",
      type: OPDS2_FEED_TYPE
    },
    searchLink
  ],
  navigation: [
    {
      href: "https://cm.example.com/catalog/fiction",
      title: "Fiction",
      rel: "subsection",
      type: OPDS2_FEED_TYPE
    },
    {
      href: "https://cm.example.com/catalog/nonfiction",
      title: "Nonfiction",
      rel: "subsection",
      type: OPDS2_FEED_TYPE
    }
  ]
};

export const loansFeed = {
  metadata: { title: "Loans and Holds" },
  links: [
    {
      href: "https://cm.example.com/loans",
      rel: "self",
      type: OPDS2_FEED_TYPE
    }
  ],
  publications: [
    loanedPublication,
    reservedPublication,
    audiobookPublication,
    noAcquisitionPublication
  ]
};
