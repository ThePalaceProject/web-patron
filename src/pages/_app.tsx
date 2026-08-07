import * as React from "react";
import ReactDOM from "react-dom";
import { AppProps, NextWebVitalsMetric } from "next/app";
import { IS_SERVER, REACT_AXE } from "../utils/env";
import { ErrorBoundary } from "components/ErrorBoundary";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";
import track from "analytics/track";
import { BreadcrumbProvider } from "components/context/BreadcrumbContext";
import AppConfigContext from "components/context/AppConfigContext";
import { initBugsnag } from "analytics/bugsnag";
import { setMediaSupportConfig } from "utils/fulfill";
import { setOpds2Enabled } from "dataflow/catalog";
import type { AppConfig } from "interfaces";
import FALLBACK_APP_CONFIG from "config/fallbackAppConfig";
import { appWithTranslation } from "next-i18next/pages";

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;
  const appConfig =
    (pageProps.appConfig as AppConfig | undefined) ?? FALLBACK_APP_CONFIG;

  // These calls are intentionally in the render body, not in useEffect. Two reasons:
  //
  // 1. initBugsnag must run before ErrorBoundary renders (synchronously below), because
  //    ErrorBoundary calls getBugsnagErrorBoundary() inline. A useEffect would run after
  //    the first commit, so the Bugsnag boundary would never be set for the initial render,
  //    silently dropping error coverage on first load.
  //
  // 2. setMediaSupportConfig and setOpds2Enabled must run during SSR: useEffect is skipped
  //    on the server, so moving them there would leave _mediaSupport as {} for every SSR
  //    pass, causing all books to appear unsupported on first load.
  //
  // All of these functions are idempotent, so repeated calls from concurrent-mode retries
  // are safe.
  initBugsnag(appConfig);
  setMediaSupportConfig(appConfig.mediaSupport);
  setOpds2Enabled(appConfig.enableOpds2);

  return (
    <AppConfigContext.Provider value={appConfig}>
      <ErrorBoundary>
        <BreadcrumbProvider>
          <Component {...pageProps} />
        </BreadcrumbProvider>
      </ErrorBoundary>
    </AppConfigContext.Provider>
  );
};

if (process.env.NODE_ENV === "development" && !IS_SERVER && REACT_AXE) {
  const axe = require("@axe-core/react");
  axe(React, ReactDOM, 1000, {});
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  track.webVitals(metric);
}

// Wrap MyApp component with appWithTranslation to provide i18n context,
// so we can use translation functions (t) in child components
// and switch translations based on locales
export default appWithTranslation(MyApp);
