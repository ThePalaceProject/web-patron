import * as React from "react";
import { LibraryData } from "interfaces";
import UrlShortener from "UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import { RouterProvider } from "./RouterContext";
import { RecommendationsProvider } from "./RecommendationsContext";
import { ActionsProvider } from "owc/ActionsContext";
import { Provider as ReakitProvider } from "reakit";
import { State } from "owc/state";
import { Store } from "redux";
import { ThemeProvider } from "theme-ui";
import makeTheme from "../../theme";
import DataFetcher from "owc/DataFetcher";
import ActionsCreator from "owc/actions";
import { adapter } from "owc/OPDSDataAdapter";
import getPathFor from "utils/getPathFor";
import { LinkUtilsProvider } from "./LinkUtilsContext";
import { SHORTEN_URLS } from "utils/env";
import { PathFor } from "owc/interfaces";
import PathForProvider from "owc/PathForContext";
import OPDSStore from "owc/StoreContext";
import { UserProvider } from "components/context/UserContext";

type ProviderProps = {
  library: LibraryData;
  store?: Store<State>;
  actions?: ActionsCreator;
  fetcher?: DataFetcher;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({
  children,
  library,
  store,
  actions,
  fetcher
}) => {
  const librarySlug = library.slug;
  const urlShortener = new UrlShortener(library.catalogUrl, SHORTEN_URLS);
  const pathFor: PathFor = getPathFor(urlShortener, librarySlug);
  const computedFetcher = React.useMemo(
    () => fetcher ?? new DataFetcher({ adapter }),
    [fetcher]
  );
  const computedActions = React.useMemo(
    () => actions ?? new ActionsCreator(computedFetcher),
    [actions, computedFetcher]
  );

  const theme = makeTheme(library.colors);

  return (
    <ThemeProvider theme={theme}>
      <ReakitProvider>
        <RouterProvider>
          <PathForProvider pathFor={pathFor}>
            <OPDSStore store={store}>
              <RecommendationsProvider>
                <ActionsProvider
                  actions={computedActions}
                  fetcher={computedFetcher}
                >
                  <LibraryProvider library={library}>
                    <LinkUtilsProvider
                      library={library}
                      urlShortener={urlShortener}
                    >
                      <UserProvider>{children}</UserProvider>
                    </LinkUtilsProvider>
                  </LibraryProvider>
                </ActionsProvider>
              </RecommendationsProvider>
            </OPDSStore>
          </PathForProvider>
        </RouterProvider>
      </ReakitProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
