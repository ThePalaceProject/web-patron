import * as React from "react";
import { AppProps, NextWebVitalsMetric } from "next/app";
import ContextProvider from "../components/context/ContextProvider";
import {
  SHORTEN_URLS,
  IS_SERVER,
  IS_DEVELOPMENT,
  REACT_AXE,
  IS_MULTI_LIBRARY
} from "../utils/env";
import getPathFor from "../utils/getPathFor";
import UrlShortener from "../UrlShortener";
import getLibraryData, {
  setLibraryData,
  getConfig
} from "../dataflow/getLibraryData";
import getOrCreateStore from "../dataflow/getOrCreateStore";
import { LibraryData } from "../interfaces";
import { State } from "opds-web-client/lib/state";
import { ThemeProvider } from "theme-ui";
import Auth from "../components/Auth";
import { AppProps } from "next/app";
import { IS_SERVER, IS_DEVELOPMENT, REACT_AXE } from "../utils/env";
import ErrorBoundary from "../components/ErrorBoundary";
import enableAxe from "utils/axe";
import "system-font-css";
import "@nypl/design-system-react-components/dist/styles.css";
import "css-overrides.css";
import makeTheme from "../theme";
import { trackWebVitals } from "analytics/track";

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
};

if (IS_DEVELOPMENT && !IS_SERVER && REACT_AXE) {
  enableAxe();
}

const AppErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div>
      <p sx={{ textAlign: "center" }}>{message}</p>
    </div>
  );
};

export function reportWebVitals(metric: NextWebVitalsMetric) {
  trackWebVitals(metric);
}

export default MyApp;
