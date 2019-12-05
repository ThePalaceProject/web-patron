import * as React from "react";
import buildStore from "../../store";
import { PathFor, PreloadedData } from "../../interfaces";
import UrlShortener from "../../UrlShortener";
import { LibraryContextProvider } from "./LibraryContext";
import { UrlShortenerProvider } from "./UrlShortenerContext";
import { InitialStateProvider } from "./InitialStateContext";
import { Provider as StoreProvider } from "react-redux";
import PathForProvider from "opds-web-client/lib/components/context/PathForContext";
import { RouterContextProvider } from "./RouterContext";

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
  const store = buildStore();
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
    <RouterContextProvider>
      <PathForProvider pathFor={pathFor}>
        <StoreProvider store={store}>
          <LibraryContextProvider library={library}>
            <UrlShortenerProvider urlShortener={urlShortener}>
              <InitialStateProvider initialState={initialState}>
                {children}
              </InitialStateProvider>
            </UrlShortenerProvider>
          </LibraryContextProvider>
        </StoreProvider>
      </PathForProvider>
    </RouterContextProvider>
  );
};

export default AppContextProvider;
