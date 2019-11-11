import * as React from "react";
import buildStore from "../store";
import { PathFor, PreloadedData } from "../interfaces";
import { State as CatalogState } from "opds-web-client/lib/state";
import { Store } from "redux";
import { State } from "../reducers";
import UrlShortener from "../UrlShortener";
import { LibraryData } from "../interfaces";

type ProviderProps = PreloadedData 

export interface AppContextType {
  store: Store<State>,
  pathFor: PathFor,
  library: LibraryData,
  urlShortener: UrlShortener,
  initialState: CatalogState 
}

export const AppContext = React.createContext<AppContextType>({
  store: null,
  pathFor: null,
  library: null,
  urlShortener: null,
  initialState: null,
})

const AppContextProvider: React.FunctionComponent<ProviderProps> = ({children, library, shortenUrls, initialState}) => {
  const store = buildStore();
  const libraryId = library.id;
  const urlShortener = new UrlShortener(library.catalogUrl, shortenUrls);
  const pathFor : PathFor = (collectionUrl, bookUrl) => {
    let path = "";
    if (libraryId) {
      path += "/" + libraryId;
    }
    if (collectionUrl) {
      let preparedCollectionUrl = urlShortener.prepareCollectionUrl(collectionUrl);
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
    <AppContext.Provider value={{
      store,
      pathFor,
      library,
      urlShortener,
      initialState
    }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider

// export default class ContextProvider extends React.Component<ContextProviderProps, {}> {
//   store: Store<State>;
//   pathFor: PathFor;
//   urlShortener: UrlShortener;

//   constructor(props) {
//     super(props);
//     this.store = buildStore();
//     const library = this.props.library.id;
//     this.urlShortener = new UrlShortener(this.props.library.catalogUrl, this.props.shortenUrls);
//     this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
//       let path = "";
//       if (library) {
//         path += "/" + library;
//       }
//       if (collectionUrl) {
//         let preparedCollectionUrl = this.urlShortener.prepareCollectionUrl(collectionUrl);
//         if (preparedCollectionUrl) {
//           path += `/collection/${preparedCollectionUrl}`;
//         }
//       }
//       if (bookUrl) {
//         path += `/book/${this.urlShortener.prepareBookUrl(bookUrl)}`;
//       }
//       if (!path) {
//         path = "/";
//       }
//       return path;
//     };
//   }

//   static childContextTypes: React.ValidationMap<any> = {
//     store: PropTypes.object.isRequired,
//     pathFor: PropTypes.func.isRequired,
//     library: PropTypes.object.isRequired,
//     urlShortener: PropTypes.object.isRequired,
//     initialState: PropTypes.object
//   };

//   getChildContext() {
//     return {
//       store: this.store,
//       pathFor: this.pathFor,
//       library: this.props.library,
//       urlShortener: this.urlShortener,
//       initialState: this.props.initialState
//     };
//   }

//   render() {
//     return React.Children.only(this.props.children);
//   };
// };