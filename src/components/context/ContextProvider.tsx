import * as React from "react";
import { LibraryData } from "interfaces";
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
  const pathFor: PathFor = getPathFor(librarySlug);
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
                    <LinkUtilsProvider library={library}>
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
