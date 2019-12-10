import * as React from "react";
import { PathFor, PreloadedData } from "../../interfaces";
import UrlShortener from "../../UrlShortener";
import { LibraryContextProvider } from "./LibraryContext";
import { UrlShortenerProvider } from "./UrlShortenerContext";
import { InitialStateProvider } from "./InitialStateContext";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterContextProvider } from "./RouterContext";
import OPDSStore from "opds-web-client/lib/components/context/StoreContext";
import BasicAuthWithButtonImagePlugin from "../../auth/BasicAuthWithButtonImagePlugin";
import OAuthPlugin from "../../auth/OAuthPlugin";
import { ComplaintsContextProvider } from "./ComplaintsContext";
import { RecommendationsContextProvider } from "./RecommendationsContext";
import { Provider as ReakitProvider } from "reakit";

type ProviderProps = PreloadedData;
/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({
  children,
  library,
  shortenUrls,
  initialState
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
    <ReakitProvider>
      <RouterContextProvider>
        <PathForProvider pathFor={pathFor}>
          <OPDSStore
            initialState={initialState}
            authPlugins={[BasicAuthWithButtonImagePlugin, OAuthPlugin]}
          >
            <RecommendationsContextProvider>
              <ComplaintsContextProvider>
                <LibraryContextProvider library={library}>
                  <UrlShortenerProvider urlShortener={urlShortener}>
                    {/* is the initial state provider necessary? Why was the initial
                          state on context originally? Seems it's only necessary to 
                          initialize the opds store, which we do above.
                      */}
                    <InitialStateProvider initialState={initialState}>
                      {children}
                    </InitialStateProvider>
                  </UrlShortenerProvider>
                </LibraryContextProvider>
              </ComplaintsContextProvider>
            </RecommendationsContextProvider>
          </OPDSStore>
        </PathForProvider>
      </RouterContextProvider>
    </ReakitProvider>
  );
};

export default AppContextProvider;
