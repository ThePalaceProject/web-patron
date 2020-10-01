/* eslint-disable camelcase */
import { NextWebVitalsMetric } from "next/app";
import { BookData, MediaLink } from "opds-web-client/lib/interfaces";
import { getMedium } from "opds-web-client/lib/utils/book";

/** Event constructors */
function event(name: string, data: Record<string, unknown>) {
  window?.dataLayer?.push({
    event: name,
    ...data
  });
}

type PageData = {
  path: string;
  codePath: string;
  appEnvironment: Record<string, unknown>;
  library?: string;
  collectionUrl?: string;
  bookUrl?: string;
};
// doesn't track an event, just updates the data layer for the page
function page(page: PageData) {
  window?.dataLayer?.push({ page });
}
function appEvent(name: string, data: Record<string, unknown>) {
  event(name, { event_category: "Other Event", ...data });
}
function bookEvent(
  name: string,
  book: BookData,
  additionalData?: Record<string, unknown>
) {
  const bookForAnalytics: BookAnalyticsData = {
    id: book.id,
    title: book.title,
    authors: book.authors?.join(", "),
    categories: book.categories,
    fiction: book.categories?.includes("Fiction") ? "fiction" : "nonfiction",
    publisher: book.publisher,
    language: book.language,
    medium:
      getMedium(book) === "http://bib.schema.org/Audiobook" ? "audio" : "book",
    openAccess:
      (book.openAccessLinks && book.openAccessLinks.length > 0) ?? false
  };
  event(name, {
    event_category: "Book Event",
    book: bookForAnalytics,
    ...additionalData
  });
}

// these come from here: https://wiki.lyrasis.org/display/SIM/SimplyE+Circulation+Analytics
type BookAnalyticsData = {
  id: string;
  title: string;
  authors?: string;
  categories?: string[];
  fiction?: "fiction" | "nonfiction";
  openAccess: boolean;
  publisher?: string;
  language?: string;
  medium: string;
  // library: string;

  // for the future
  audience?: string;
  targetAge?: string;
  genre?: string;
  distributor?: string;
};

/**
 * Tracking functions
 */

function bookBorrowed(url: string, book: BookData) {
  bookEvent("book_borrowed", book, { borrowUrlUsed: url });
}
function bookReserved(url: string, book: BookData) {
  bookEvent("book_reserved", book, { reserveUrlUsed: url });
}
function bookFulfilled(link: MediaLink, book: BookData) {
  bookEvent("book_fulfilled", book, { fulfilledLink: link });
}
function bookLoaded(book: BookData) {
  bookEvent("book_loaded", book);
}

function collectionLoaded(collectionData: {
  title?: string;
  id: string;
  url?: string;
}) {
  appEvent("collection_loaded", {
    collection: collectionData
  });
}

function loansLoaded() {
  appEvent("loans_loaded", {});
}

function searchPerformed(data: { searchQuery: string }) {
  appEvent("search_performed", data);
}

function signedIn(data: { loansId: string }) {
  appEvent("signed_in", data);
}

// allows us to track performance using web vitals reports
// https://nextjs.org/docs/advanced-features/measuring-performance
function webVitals({ id, name, value, label }: NextWebVitalsMetric) {
  appEvent("performance_metric_recorded", {
    metric_name: name,
    metric_category:
      label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    metric_value: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    metric_id: id // id unique to current page load
  });
}

export default {
  webVitals,
  signedIn,
  searchPerformed,
  collectionLoaded,
  bookLoaded,
  bookBorrowed,
  bookReserved,
  bookFulfilled,
  page,
  loansLoaded
};
