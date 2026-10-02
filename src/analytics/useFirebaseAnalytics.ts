/* eslint-disable camelcase */
import * as React from "react";
import { useRouter } from "next/router";
import firebase from "analytics/firebase";
import { stripCredentials } from "utils/url";
import type { AppConfig, LibraryData } from "interfaces";

export default function useFirebaseAnalytics(
  appConfig: AppConfig,
  library: Pick<LibraryData, "id" | "slug"> | null
): void {
  const { asPath, locale, isFallback } = useRouter();
  const lastLogged = React.useRef<string | null>(null);

  React.useEffect(() => {
    firebase.init(appConfig, library);
  }, [appConfig, library]);

  // Send custom page_view events whenever the user changes pages.
  React.useEffect(() => {
    if (isFallback) return;

    // Read from the window rather than from `asPath`,
    // because `asPath` omits the locale prefix that the address bar keeps.
    const page_location = stripCredentials(window.location.href);

    // guard against re-renders
    if (lastLogged.current === page_location) return;
    lastLogged.current = page_location;

    firebase.logEvent("page_view", {
      page_location,
      page_title: document.title,
      locale
    });
  }, [asPath, locale, isFallback]);
}
