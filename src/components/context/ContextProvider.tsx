import * as React from "react";
import { PathFor, PreloadedData } from "../../interfaces";
import UrlShortener from "../../UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import { UrlShortenerProvider } from "./UrlShortenerContext";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterProvider } from "./RouterContext";
import OPDSStore from "opds-web-client/lib/components/context/StoreContext";
import { RecommendationsProvider } from "./RecommendationsContext";
import { ActionsProvider } from "opds-web-client/lib/components/context/ActionsContext";
import { Provider as ReakitProvider } from "reakit";
import { HelmetProvider } from "react-helmet-async";
import { ViewProvider } from "./ViewContext";
import { State } from "opds-web-client/lib/state";
import { Store } from "redux";

type ProviderProps = PreloadedData & {
  // we allow custom store to be passed in for the sake of mocking during testing
  store?: Store<State>;
};
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({
  children,
  library,
  shortenUrls,
  initialState,
  helmetContext,
  store
}) => {
  const libraryId = library.id;
  const urlShortener = new UrlShortener(library.catalogUrl, shortenUrls);
  const pathFor: PathFor = (collectionUrl, bookUrl) => {
    let path = "";
    if (libraryId) {
      path += "/" + libraryId;
    }
    if (collectionUrl) {
      const preparedCollectionUrl = urlShortener.prepareCollectionUrl(
        collectionUrl
      );
      if (preparedCollectionUrl) {
        path += `/collection/${preparedCollectionUrl}`;
      }
    }
    if (bookUrl) {
      path += `/book/${urlShortener.prepareBookUrl(bookUrl)}`;
    }
    if (!path) {
      path = "/";
    }
    return path;
  };
  return (
    <HelmetProvider context={helmetContext}>
      <ReakitProvider>
        <RouterProvider>
          <PathForProvider pathFor={pathFor}>
            <OPDSStore initialState={initialState} store={store}>
              <RecommendationsProvider>
                <ActionsProvider>
                  <LibraryProvider library={library}>
                    <UrlShortenerProvider urlShortener={urlShortener}>
                      <ViewProvider>{children}</ViewProvider>
                    </UrlShortenerProvider>
                  </LibraryProvider>
                </ActionsProvider>
              </RecommendationsProvider>
            </OPDSStore>
          </PathForProvider>
        </RouterProvider>
      </ReakitProvider>
    </HelmetProvider>
  );
};

export default AppContextProvider;
