/* eslint-disable camelcase */
import * as React from "react";
import { useRouter } from "next/router";
import firebase from "analytics/firebase";
import type { AppConfig, LibraryData } from "interfaces";

export default function useFirebaseAnalytics(
  appConfig: AppConfig,
  library: Pick<LibraryData, "id" | "slug"> | null
): void {
  const { asPath, pathname, locale, isFallback } = useRouter();
  const lastLogged = React.useRef<string | null>(null);

  React.useEffect(() => {
    firebase.init(appConfig, library);
  }, [appConfig, library]);

  // Send custom page_view events whenever the user changes pages.
  React.useEffect(() => {
    if (isFallback) return;

    // guard against re-renders
    if (lastLogged.current === window.location.href) return;
    lastLogged.current = window.location.href;

    firebase.logEvent("page_view", {
      page_location: pathname,
      locale
    });
    // include `asPath` to check for page navigation
  }, [asPath, pathname, locale, isFallback]);
}
