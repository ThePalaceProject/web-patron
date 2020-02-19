import * as React from "react";
import { PathFor, PreloadedData } from "../../interfaces";
import UrlShortener from "../../UrlShortener";
import { LibraryProvider } from "./LibraryContext";
import { UrlShortenerProvider } from "./UrlShortenerContext";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterProvider } from "./RouterContext";
import OPDSStore from "opds-web-client/lib/components/context/StoreContext";
import BasicAuthWithButtonImagePlugin from "../../auth/BasicAuthWithButtonImagePlugin";
import { RecommendationsProvider } from "./RecommendationsContext";
import { ActionsProvider } from "opds-web-client/lib/components/context/ActionsContext";
import { Provider as ReakitProvider } from "reakit";
import { HelmetProvider } from "react-helmet-async";
import { ViewProvider } from "./ViewContext";

type ProviderProps = PreloadedData;
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({
  children,
  library,
  shortenUrls,
  initialState,
  helmetContext
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
            <OPDSStore
              initialState={initialState}
              authPlugins={[BasicAuthWithButtonImagePlugin]}
            >
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
