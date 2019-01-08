import * as React from "react";
import buildStore from "../store";
import { PathFor } from "../interfaces";
import { State as CatalogState } from "opds-web-client/lib/state";
import { Store } from "redux";
import { State } from "../reducers";
import UrlShortener from "../UrlShortener";
import { LibraryData } from "../interfaces";

export interface ContextProviderProps extends React.Props<ContextProvider> {
  library: LibraryData;
  shortenUrls?: boolean;
  initialState?: CatalogState;
}

export default class ContextProvider extends React.Component<ContextProviderProps, void> {
  store: Store<State>;
  pathFor: PathFor;
  urlShortener: UrlShortener;

  constructor(props) {
    super(props);
    this.store = buildStore();
    const library = this.props.library.id;
    this.urlShortener = new UrlShortener(this.props.library.catalogUrl, this.props.shortenUrls);
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "";
      if (library) {
        path += "/" + library;
      }
      if (collectionUrl) {
        let preparedCollectionUrl = this.urlShortener.prepareCollectionUrl(collectionUrl);
        if (preparedCollectionUrl) {
          path += `/collection/${preparedCollectionUrl}`;
        }
      }
      if (bookUrl) {
        path += `/book/${this.urlShortener.prepareBookUrl(bookUrl)}`;
      }
      if (!path) {
        path = "/";
      }
      return path;
    };
  }

  static childContextTypes: React.ValidationMap<any> = {
    store: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    library: React.PropTypes.object.isRequired,
    urlShortener: React.PropTypes.object.isRequired,
    initialState: React.PropTypes.object
  };

  getChildContext() {
    return {
      store: this.store,
      pathFor: this.pathFor,
      library: this.props.library,
      urlShortener: this.urlShortener,
      initialState: this.props.initialState
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};