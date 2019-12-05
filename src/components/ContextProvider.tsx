import * as React from "react";
import buildStore from "../store";
import { PathFor, PreloadedData } from "../interfaces";
import { State as CatalogState } from "opds-web-client/lib/state";
import { Store } from "redux";
import { State } from "../reducers";
import UrlShortener from "../UrlShortener";
import { LibraryData } from "../interfaces";

type ProviderProps = PreloadedData;

export interface AppContextType {
  store: Store<State>;
  pathFor: PathFor;
  library: LibraryData;
  urlShortener: UrlShortener;
  initialState: CatalogState;
}

export const AppContext = React.createContext<AppContextType>({
  store: null,
  pathFor: null,
  library: null,
  urlShortener: null,
  initialState: null
});

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
    <AppContext.Provider
      value={{
        store,
        pathFor,
        library,
        urlShortener,
        initialState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
