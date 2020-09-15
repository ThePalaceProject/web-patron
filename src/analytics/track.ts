/* eslint-disable camelcase */
import { NextWebVitalsMetric } from "next/app";
import { BookData } from "opds-web-client/lib/interfaces";
import { getMedium } from "opds-web-client/lib/utils/book";

type AnyEvent = BookEvent | OtherEvent;

function event(name: AnyEvent, data: Record<string, unknown>) {
  window?.dataLayer?.push({
    event: name,
    ...data
  });
}

// these come from here: https://wiki.lyrasis.org/display/SIM/SimplyE+Circulation+Analytics
type BookAnalyticsData = {
  id: string;
  title: string;
  authors?: string[];
  categories?: string[];
  fiction?: boolean;
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

type BookEvent =
  | "book_borrowed"
  | "book_reserved"
  | "book_fulfilled"
  | "book_loaded";

export function bookEvent(
  name: BookEvent,
  book: BookData,
  additionalData?: Record<string, unknown>
) {
  const bookForAnalytics: BookAnalyticsData = {
    id: book.id,
    title: book.title,
    authors: book.authors,
    categories: book.categories,
    fiction: book.categories?.includes("Fiction"),
    publisher: book.publisher,
    language: book.language,
    medium: getMedium(book),
    openAccess:
      (book.openAccessLinks && book.openAccessLinks.length > 0) ?? false
  };
  event(name, {
    event_category: "Book Event",
    book: bookForAnalytics,
    ...additionalData
  });
}

type OtherEvent =
  | "search_performed"
  | "collection_loaded"
  | "pageview"
  | "performance_metric_recorded";
export function appEvent(name: OtherEvent, data: any) {
  event(name, { event_category: "Other Event", ...data });
}

// allows us to track performance using web vitals reports
// https://nextjs.org/docs/advanced-features/measuring-performance
export function trackWebVitals({
  id,
  name,
  value,
  label
}: NextWebVitalsMetric) {
  appEvent("performance_metric_recorded", {
    metric_name: name,
    metric_category:
      label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    metric_value: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    metric_id: id // id unique to current page load
  });
}
