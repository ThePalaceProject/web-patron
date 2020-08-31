/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import { GTM_ID } from "utils/env";
import { NextWebVitalsMetric } from "next/app";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export function pageView(url: string) {
  window?.gtag?.("config", GTM_ID, {
    page_path: url
  });
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export function event({ action, category, label, value }) {
  window?.gtag?.("event", action, {
    event_category: category,
    event_label: label,
    value
  });
}

export function trackWebVitals({
  id,
  name,
  value,
  label
}: NextWebVitalsMetric) {
  window?.gtag?.("send", "event", {
    eventCategory:
      label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    eventAction: name,
    eventValue: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    eventLabel: id, // id unique to current page load
    nonInteraction: true // avoids affecting bounce rate.
  });
}
