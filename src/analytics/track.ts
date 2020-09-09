/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import { NextWebVitalsMetric } from "next/app";

export function updateDataLayer(data: any) {
  window?.dataLayer?.push(data);
}

type AnyEvent = ApplicationEvent | UserEvent;

function event(name: AnyEvent, data: any) {
  window?.dataLayer?.push({
    event: name,
    ...data
  });
}

type UserEvent =
  | "search_performed"
  | "book_borrowed"
  | "book_reserved"
  | "book_fulfilled"
  | "pageview";
export function userEvent(name: UserEvent, data: any) {
  event(name, { event_category: "User Event", ...data });
}

type ApplicationEvent =
  | "collection_loaded"
  | "book_loaded"
  | "performance_metric_recorded";
export function appEvent(name: ApplicationEvent, data: any) {
  event(name, { event_category: "Application Event", ...data });
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
