/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import { NextWebVitalsMetric } from "next/app";
import { BookData } from "opds-web-client/lib/interfaces";

export function updateDataLayer(data: any) {
  window?.dataLayer?.push(data);
}

function event(name: string, data: any) {
  window?.dataLayer?.push({
    event: name,
    ...data
  });
}

type UserEvent =
  | "searched"
  | "borrowed_or_reserved_book"
  | "fulfilled_book"
  | "pageview";
export function userEvent(name: UserEvent, data: any) {
  event(name, { eventCategory: "User Event", ...data });
}

type ApplicationEvent = "loaded_collection" | "loaded_book";
export function appEvent(name: ApplicationEvent, data: any) {
  event(name, { eventCategory: "Application Event", ...data });
}

// allows us to track performance using web vitals reports
// https://nextjs.org/docs/advanced-features/measuring-performance
export function trackWebVitals({
  id,
  name,
  value,
  label
}: NextWebVitalsMetric) {
  event(name, {
    eventCategory: "Performance",
    label: label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    value: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    metricId: id // id unique to current page load
  });
}
