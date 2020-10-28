import * as React from "react";
import { LibraryData } from "interfaces";
import { LibraryProvider } from "./LibraryContext";
import { Provider as ReakitProvider } from "reakit";
import { ThemeProvider } from "theme-ui";
import makeTheme from "../../theme";
import { UserProvider } from "components/context/UserContext";
import AuthModal from "auth/AuthModal";
import { ConfigInterface, SWRConfig } from "swr";
import track from "analytics/track";
import { ServerError } from "errors";

type ProviderProps = {
  library: LibraryData;
};

const swrOptions: ConfigInterface<any, Error> = {
  // we don't generally need to revalidate our data very often
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  onError: (err, key, config) => {
    let severity: "warning" | "info" | "error" = "warning";
    if (err instanceof ServerError) {
      if (err.info.status === 401 || err.info.status === 404) {
        severity = "info";
      }
    }
    track.error(err, {
      severity,
      metadata: {
        "Fetch Info": {
          key,
          config
        }
      }
    });
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount = 0 }) => {
    if (error instanceof ServerError) {
      // Never retry on 404 or 401.
      if (error.info.status === 404) return;
      if (error.info.status === 401) return;
    }
    // Only retry up to 10 times.
    if (retryCount >= 10) return;
    // Retry after 5 seconds.
    setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000);
  }
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const theme = makeTheme(library.colors);

  return (
    <SWRConfig value={swrOptions}>
      <ThemeProvider theme={theme}>
        <ReakitProvider>
          <LibraryProvider library={library}>
            <UserProvider>
              <AuthModal>{children}</AuthModal>
            </UserProvider>
          </LibraryProvider>
        </ReakitProvider>
      </ThemeProvider>
    </SWRConfig>
  );
};

export default AppContextProvider;
