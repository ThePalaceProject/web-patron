/* eslint-disable camelcase */
import * as React from "react";
import { useRouter } from "next/router";
import firebase from "analytics/firebase";
import type { AppConfig, LibraryData } from "interfaces";
import { stripCredentials } from "utils/url";

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

    // Comparing URLs without query params or hashes guards specifically against
    // auth redirects (e.g. SAML, OIDC) where patron credentials are included.
    const location = stripCredentials(window.location.href);

    // guard against re-renders
    if (lastLogged.current === location) return;
    lastLogged.current = location;

    firebase.logEvent("page_view", {
      page_location: `${window.location.origin}${pathname}`,
      locale
    });
    // include `asPath` to check for page navigation
  }, [asPath, pathname, locale, isFallback]);
}
