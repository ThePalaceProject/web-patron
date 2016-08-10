import * as React from "react";
import buildStore from "../store";
import { PathFor } from "../interfaces";
import { State as CatalogState } from "opds-web-client/lib/state";
import { buildCollectionStore } from "opds-web-client/lib/store";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { Store } from "redux";
import { State } from "../reducers";

export interface ContextProviderProps extends React.Props<any> {
  homeUrl: string;
  catalogBase: string;
  initialState?: CatalogState;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  pathFor: PathFor;
  store: Store<State>
  recommendationsStore: Store<{ collection: CollectionData }>;

  constructor(props) {
    super(props);
    this.store = buildStore();
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "";
      path +=
        collectionUrl ?
        `/collection/${this.prepareCollectionUrl(collectionUrl)}` :
        "";
      path +=
        bookUrl ?
        `/book/${this.prepareBookUrl(bookUrl)}` :
        "";
      return path;
    };
    this.recommendationsStore = buildCollectionStore();
  }

  prepareCollectionUrl(url: string): string {
    return encodeURIComponent(
      url.replace(this.props.catalogBase + "/", "").replace(/\/$/, "").replace(/^\//, "")
    );
  }

  prepareBookUrl(url: string): string {
    return encodeURIComponent(
      url.replace(this.props.catalogBase + "/works/", "").replace(/\/$/, "").replace(/^\//, "")
    );
  }

  static childContextTypes: React.ValidationMap<any> = {
    patronStore: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    initialState: React.PropTypes.object,
    store: React.PropTypes.object.isRequired,
    recommendationsStore: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      patronStore: this.store,
      pathFor: this.pathFor,
      homeUrl: this.props.homeUrl,
      catalogBase: this.props.catalogBase,
      initialState: this.props.initialState,
      store: this.store,
      recommendationsStore: this.recommendationsStore
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};