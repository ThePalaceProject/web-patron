import {
  AnyBook,
  Book,
  BookAvailability,
  BookFormat,
  CollectionData,
  FacetGroupData,
  FulfillmentLink,
  LaneData,
  LinkData,
  OPDS1,
  OPDS2
} from "interfaces";
import {
  AcquisitionLinkRel,
  BorrowLinkRel,
  EPUB_MEDIA_TYPES,
  HTMLMediaType,
  PdfMediaType,
  PreviewRel,
  RevokeLinkRel,
  ShelfLinkRel,
  TrackOpenBookRel
} from "types/opds1";
import {
  Opds2Feed,
  Opds2Group,
  Opds2Link,
  Opds2Publication
} from "validation/opds2Catalog";
import { dedupeBooks, fixMimeType, formatDate } from "dataflow/opds1/parse";
import { getAppSupportLevel } from "utils/fulfill";
import { formatDuration } from "utils/duration";
import DOMPurify from "dompurify";

/**
 * Parses an OPDS 2 catalog feed or publication from a Palace Circulation
 * Manager into a Collection or Book, producing the same internal model as
 * dataflow/opds1/parse.ts does for Atom feeds.
 *
 * Because validation of the incoming JSON is lenient (see
 * validation/opds2Catalog.ts), every leaf value here is treated defensively:
 * helpers accept unknown-ish data and return undefined rather than throwing
 * when a field has an unexpected shape.
 */

const OpenAccessLinkRel = "http://opds-spec.org/acquisition/open-access";
const ThumbnailImageRel = "http://opds-spec.org/image/thumbnail";
const AudiobookType = "http://schema.org/Audiobook";

/**
 * Utils
 */

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// Lenient validation means array-typed fields may not actually be arrays at
// runtime; treat anything else as empty.
function asArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value.filter(isDefined) : [];
}

function resolveOptional(base: string, href: unknown): string | undefined {
  if (typeof href !== "string" || href.length === 0) return undefined;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

function rels(link: Opds2Link): string[] {
  if (typeof link.rel === "string") return [link.rel];
  if (Array.isArray(link.rel)) {
    return link.rel.filter((r): r is string => typeof r === "string");
  }
  return [];
}

function hasRel(link: Opds2Link, rel: string): boolean {
  return rels(link).includes(rel);
}

// Matches every acquisition rel (generic, open-access, borrow, buy, sample,
// subscribe), mirroring how opds-feed-parser classifies acquisition links.
function isAcquisitionLink(link: Opds2Link): boolean {
  return rels(link).some(rel => rel.startsWith(AcquisitionLinkRel));
}

function linkHref(link: Opds2Link | undefined): string | undefined {
  return typeof link?.href === "string" && link.href.length > 0
    ? link.href
    : undefined;
}

/**
 * A LanguageMap serializes as either a plain string or a
 * {language: translation} object; take the first translation in the
 * latter case.
 */
function languageMapToString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value !== null && typeof value === "object") {
    return Object.values(value).find((v): v is string => typeof v === "string");
  }
  return undefined;
}

/**
 * Contributor-role and subject fields serialize as a string, an object, or
 * an array of either. Normalizes to an array of the object-or-string
 * entries.
 */
function toEntryArray(field: unknown): (string | Record<string, unknown>)[] {
  if (field === null || field === undefined) return [];
  const arr = Array.isArray(field) ? field : [field];
  return arr.filter(
    (entry): entry is string | Record<string, unknown> =>
      typeof entry === "string" ||
      (entry !== null && typeof entry === "object" && !Array.isArray(entry))
  );
}

function entryName(
  entry: string | Record<string, unknown>
): string | undefined {
  if (typeof entry === "string") return entry;
  return languageMapToString(entry.name);
}

function contributorNames(field: unknown): string[] {
  return toEntryArray(field).map(entryName).filter(isDefined);
}

/**
 * Acquisition format parsing
 */

type AcquisitionObject = { type?: string; child?: unknown[] };

function asAcquisitionObject(value: unknown): AcquisitionObject | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const { type, child } = value as Record<string, unknown>;
  return {
    type: typeof type === "string" ? type : undefined,
    child: Array.isArray(child) ? child : undefined
  };
}

function indirectAcquisitions(link: Opds2Link): AcquisitionObject[] {
  const raw = link.properties?.indirectAcquisition;
  if (!Array.isArray(raw)) return [];
  return raw.map(asAcquisitionObject).filter(isDefined);
}

type ParsedFormat = {
  contentType: OPDS1.AnyBookMediaType;
  indirectionType?: OPDS1.IndirectAcquisitionType;
};

/**
 * The CM types the OPDS-entry indirection level of an acquisition chain as
 * the OPDS 2 publication media type in OPDS 2 feeds (it is the same semantic
 * link type the OPDS 1 serializer writes as the Atom entry type). The
 * internal model, the media-support configuration, and the entry-indirection
 * fulfillment flow all identify that level by the OPDS 1 entry media type,
 * so acquisition types are normalized to it.
 */
function normalizeAcquisitionType(
  type: string | undefined
): string | undefined {
  return type === OPDS2.PublicationMediaType ? OPDS1.OPDSEntryMediaType : type;
}

/**
 * The content type of an acquisition is the innermost nested type, and the
 * wrapping type becomes the indirection type — the same rule
 * dataflow/opds1/parse.ts applies to opds:indirectAcquisition elements.
 */
function parseEntryFormat(entry: AcquisitionObject): ParsedFormat {
  const childType = normalizeAcquisitionType(
    asAcquisitionObject(entry.child?.[0])?.type
  );
  const entryType = normalizeAcquisitionType(entry.type);
  const contentType = (childType ?? entryType) as OPDS1.AnyBookMediaType;
  const indirectionType = childType
    ? (entryType as OPDS1.IndirectAcquisitionType)
    : undefined;
  return { contentType, indirectionType };
}

function parseLinkFormat(link: Opds2Link): ParsedFormat {
  const indirectType = normalizeAcquisitionType(
    indirectAcquisitions(link)[0]?.type
  );
  const linkType = normalizeAcquisitionType(link.type);
  const contentType = (indirectType ?? linkType) as OPDS1.AnyBookMediaType;
  const indirectionType = indirectType
    ? (linkType as OPDS1.IndirectAcquisitionType)
    : undefined;
  return { contentType, indirectionType };
}

function buildFulfillmentLink(feedUrl: string) {
  return (link: Opds2Link): FulfillmentLink | undefined => {
    const url = resolveOptional(feedUrl, link.href);
    if (!url) return undefined;
    const { contentType, indirectionType } = parseLinkFormat(link);
    return {
      url,
      contentType,
      indirectionType: indirectionType && fixMimeType(indirectionType),
      supportLevel: getAppSupportLevel(contentType, indirectionType)
    };
  };
}

/**
 * Finds the first borrow link with at least one format the app supports,
 * matching getBorrowLink in dataflow/opds1/parse.ts.
 */
function getBorrowLink(links: Opds2Link[]): Opds2Link | null {
  return (
    links.find(link => {
      if (!hasRel(link, BorrowLinkRel) || !linkHref(link)) return false;
      return indirectAcquisitions(link).some(entry => {
        const { contentType, indirectionType } = parseEntryFormat(entry);
        return (
          getAppSupportLevel(contentType, indirectionType) !== "unsupported"
        );
      });
    }) ?? null
  );
}

/**
 * Preserves the ordering rule from dataflow/opds1/parse.ts: the first
 * linearized acquisition type wins when inferring an eBook format.
 */
function inferEBookFormat(
  fulfillmentLinks: FulfillmentLink[],
  borrowLink: Opds2Link | null
): BookFormat | undefined {
  let mimeType: string | undefined;

  if (fulfillmentLinks.length > 0) {
    mimeType = fulfillmentLinks[0]?.contentType;
  } else if (borrowLink) {
    mimeType = indirectAcquisitions(borrowLink)
      .flatMap(entry =>
        entry.child && entry.child.length > 0
          ? entry.child.map(child => asAcquisitionObject(child)?.type)
          : [entry.type]
      )
      .filter(isDefined)
      .at(0);
  }

  if (mimeType) {
    if (EPUB_MEDIA_TYPES.includes(mimeType as OPDS1.AnyBookMediaType)) {
      return "ePub";
    }
    if (mimeType === PdfMediaType) {
      return "PDF";
    }
  }
  return undefined;
}

/**
 * Converters
 */

export function publicationToBook(
  pub: Opds2Publication,
  feedUrl: string
): AnyBook {
  const metadata: NonNullable<Opds2Publication["metadata"]> =
    pub.metadata ?? {};
  const links = asArray(pub.links);
  const images = asArray(pub.images);

  const title = languageMapToString(metadata.title) ?? "";
  const subtitle = languageMapToString(metadata.subtitle);

  const authors = contributorNames(metadata.author);
  const narratorNames = contributorNames(metadata.narrator);
  const narrators = narratorNames.length > 0 ? narratorNames : undefined;
  const contributors = contributorNames(metadata.contributor);

  const thumbnailLink =
    images.find(link => hasRel(link, ThumbnailImageRel)) ?? images[0];
  const imageUrl = resolveOptional(feedUrl, thumbnailLink?.href);

  const detailLink =
    links.find(
      link =>
        hasRel(link, "alternate") && link.type === OPDS2.PublicationMediaType
    ) ??
    links.find(link => hasRel(link, "alternate")) ??
    links.find(link => hasRel(link, "self"));
  const detailUrl = resolveOptional(feedUrl, detailLink?.href) ?? feedUrl;

  const subjects = toEntryArray(metadata.subject);
  const isAudienceSubject = (entry: string | Record<string, unknown>) =>
    typeof entry !== "string" && entry.scheme === "http://schema.org/audience";
  const audience = subjects.filter(isAudienceSubject).map(entryName)[0];
  const categories = subjects
    .filter(entry => !isAudienceSubject(entry))
    .map(entryName)
    .filter(isDefined);

  const acquisitionLinks = links.filter(isAcquisitionLink);
  const borrowLink = getBorrowLink(acquisitionLinks);

  const availability = borrowLink?.properties?.availability;
  // The OPDS 2 availability state defaults to "available" when omitted, so a
  // borrow link without explicit availability is treated as available.
  const borrowState: BookAvailability | undefined = borrowLink
    ? (availability?.state ?? "available")
    : undefined;

  const holds = borrowLink?.properties?.holds;
  const copies = borrowLink?.properties?.copies;

  // Built the same way as fulfillmentLinks below: an open-access link can
  // carry its own indirection chain (e.g. a bearer-token-wrapped format for
  // anonymous direct fulfillment), so contentType, indirectionType, and
  // supportLevel must all come from the same parsed chain.
  const openAccessLinks: FulfillmentLink[] = acquisitionLinks
    .filter(link => hasRel(link, OpenAccessLinkRel))
    .map(buildFulfillmentLink(feedUrl))
    .filter(isDefined);

  const fulfillmentLinks = acquisitionLinks
    .filter(link => hasRel(link, AcquisitionLinkRel))
    .map(buildFulfillmentLink(feedUrl))
    .filter(isDefined);

  const supportedFulfillmentLinks = fulfillmentLinks.filter(
    link => link.supportLevel !== "unsupported"
  );

  const format =
    metadata["@type"] === AudiobookType
      ? "Audiobook"
      : inferEBookFormat(fulfillmentLinks, borrowLink);

  const revokeUrl =
    linkHref(links.find(link => hasRel(link, RevokeLinkRel))) ?? null;

  const trackOpenBookUrl =
    linkHref(links.find(link => hasRel(link, TrackOpenBookRel))) ?? null;

  const previewUrl =
    linkHref(
      links.find(
        link => hasRel(link, PreviewRel) && link.type === HTMLMediaType
      )
    ) ?? null;

  const relatedUrl =
    linkHref(links.find(link => hasRel(link, "related"))) ?? null;

  const seriesEntry = toEntryArray(metadata.belongsTo?.series)[0];
  const seriesName = seriesEntry ? entryName(seriesEntry) : undefined;
  const seriesPosition =
    typeof seriesEntry === "object" && typeof seriesEntry.position === "number"
      ? seriesEntry.position
      : undefined;
  // The CM's OPDS 2 output carries no series feed link, so series.url is
  // always undefined here (unlike the OPDS 1 parser).
  const series = seriesName
    ? { name: seriesName, position: seriesPosition }
    : undefined;

  const language =
    typeof metadata.language === "string"
      ? metadata.language
      : Array.isArray(metadata.language)
        ? metadata.language.find(l => typeof l === "string")
        : undefined;

  const book: Book = {
    id:
      typeof metadata.identifier === "string" ? metadata.identifier : detailUrl,
    title,
    subtitle,
    authors,
    contributors,
    narrators,
    summary:
      typeof metadata.description === "string"
        ? DOMPurify.sanitize(metadata.description)
        : undefined,
    imageUrl,
    availability: {
      since: availability?.since,
      until: availability?.until,
      // borrowState is undefined when there is no borrow link, matching the
      // OPDS 1 parser; our internal type is stricter, hence the cast.
      status: borrowState as BookAvailability
    },
    holds:
      holds && typeof holds.total === "number"
        ? { total: holds.total, position: holds.position }
        : undefined,
    copies:
      copies &&
      typeof copies.total === "number" &&
      typeof copies.available === "number"
        ? { total: copies.total, available: copies.available }
        : undefined,
    audience,
    categories,
    publisher: contributorNames(metadata.publisher)[0],
    published:
      typeof metadata.published === "string"
        ? formatDate(metadata.published)
        : undefined,
    language,
    duration:
      typeof metadata.duration === "number"
        ? formatDuration(metadata.duration)
        : undefined,
    format,
    series,
    url: detailUrl,
    relatedUrl,
    trackOpenBookUrl,
    previewUrl,
    raw: pub
  };

  // The status cascade below mirrors entryToBook in dataflow/opds1/parse.ts
  // exactly, including its ordering.

  // It's fulfillable
  if (
    supportedFulfillmentLinks.length > 0 ||
    (!borrowLink && openAccessLinks.length > 0)
  ) {
    return {
      ...book,
      status: "fulfillable",
      fulfillmentLinks: [...supportedFulfillmentLinks, ...openAccessLinks],
      revokeUrl
    };
  }

  // it's a reserved book
  if (borrowState === "reserved") {
    return {
      ...book,
      status: "reserved",
      revokeUrl
    };
  }

  const borrowUrl = borrowLink ? linkHref(borrowLink) : undefined;

  // it's a reservable book
  if (borrowUrl && borrowState === "unavailable") {
    return {
      ...book,
      status: "reservable",
      reserveUrl: borrowUrl
    };
  }

  // it is on hold and ready to borrow
  if (borrowUrl && borrowState === "ready") {
    return {
      ...book,
      status: "on-hold",
      borrowUrl
    };
  }

  // it's a borrowable book
  if (borrowUrl && borrowState === "available") {
    return {
      ...book,
      status: "borrowable",
      borrowUrl
    };
  }

  // it is unsupported
  return {
    ...book,
    status: "unsupported"
  };
}

function linkToLinkData(
  feedUrl: string,
  link: Opds2Link | undefined
): LinkData | null {
  if (!link) return null;
  const url = resolveOptional(feedUrl, link.href);
  if (!url) return null;
  return {
    url,
    text: typeof link.title === "string" ? link.title : undefined,
    type: rels(link)[0]
  };
}

function navigationToLinkData(
  feedUrl: string,
  navigation: Opds2Link[]
): LinkData[] {
  return navigation
    .map((link): LinkData | null => {
      const url = resolveOptional(feedUrl, link.href);
      if (!url) return null;
      return {
        id: linkHref(link),
        text: typeof link.title === "string" ? link.title : undefined,
        url
      };
    })
    .filter((link): link is LinkData => link !== null);
}

/**
 * Maps publications to books, dropping publications with no acquisition
 * links at all (e.g. a loan for a title removed from the collection): they
 * cannot be fulfilled by any application. This mirrors the entry
 * classification in the OPDS 1 feedToCollection.
 */
function publicationsToBooks(
  publications: Opds2Publication[],
  feedUrl: string
): AnyBook[] {
  return publications
    .filter(pub => asArray(pub.links).some(isAcquisitionLink))
    .map(pub => publicationToBook(pub, feedUrl));
}

function groupToLane(group: Opds2Group, feedUrl: string): LaneData | null {
  const publications = group.publications ?? [];
  if (publications.length === 0) return null;
  const selfLink = asArray(group.links).find(link => hasRel(link, "self"));
  return {
    title: languageMapToString(group.metadata?.title) ?? "",
    url: resolveOptional(feedUrl, selfLink?.href) ?? feedUrl,
    books: dedupeBooks(publicationsToBooks(publications, feedUrl))
  };
}

export function feedToCollection(
  feed: Opds2Feed,
  feedUrl: string
): CollectionData {
  const feedLinks = asArray(feed.links);
  const selfUrl = resolveOptional(
    feedUrl,
    feedLinks.find(link => hasRel(link, "self"))?.href
  );

  const books = dedupeBooks(
    publicationsToBooks(feed.publications ?? [], feedUrl)
  );

  const lanes: LaneData[] = [];
  const navigationLinks = navigationToLinkData(
    feedUrl,
    asArray(feed.navigation)
  );
  for (const group of asArray(feed.groups)) {
    const lane = groupToLane(group, feedUrl);
    if (lane) {
      lanes.push(lane);
    } else {
      // A navigation-only group (allowed by the OPDS 2 model, though the CM
      // does not currently emit one) folds into the top-level navigation.
      navigationLinks.push(
        ...navigationToLinkData(feedUrl, asArray(group.navigation))
      );
    }
  }

  const facetGroups: FacetGroupData[] = asArray(feed.facets)
    .map(facet => {
      const facetLinks = asArray(facet.links);
      return {
        label: languageMapToString(facet.metadata?.title) ?? "",
        facets: facetLinks
          .map(link => {
            const href = resolveOptional(feedUrl, link.href);
            if (!href) return null;
            return {
              label: typeof link.title === "string" ? link.title : "",
              href,
              // The CM marks the currently applied facet with rel="self".
              active: hasRel(link, "self")
            };
          })
          .filter(isDefined)
      };
    })
    .filter(group => group.facets.length > 0);

  const nextPageUrl = resolveOptional(
    feedUrl,
    feedLinks.find(link => hasRel(link, "next"))?.href
  );

  const catalogRootLink = linkToLinkData(
    feedUrl,
    feedLinks.find(link => hasRel(link, OPDS1.CatalogRootRel))
  );
  const parentLink = linkToLinkData(
    feedUrl,
    feedLinks.find(link => hasRel(link, "up"))
  );

  const shelfUrl = linkHref(feedLinks.find(link => hasRel(link, ShelfLinkRel)));

  // The CM includes an OpenSearch description link in OPDS 2 feeds too, so
  // the existing OpenSearch-based search flow keeps working unchanged.
  const searchDataUrl =
    linkHref(feedLinks.find(link => hasRel(link, "search"))) ?? null;

  const links = feedLinks
    .map(link => linkToLinkData(feedUrl, link))
    .filter((link): link is LinkData => link !== null);

  return {
    id: selfUrl ?? feedUrl,
    url: feedUrl,
    title: languageMapToString(feed.metadata?.title) ?? "",
    lanes,
    books,
    navigationLinks,
    facetGroups,
    nextPageUrl,
    catalogRootLink,
    parentLink,
    shelfUrl,
    links,
    searchDataUrl,
    raw: feed
  };
}
