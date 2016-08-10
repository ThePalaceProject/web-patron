import * as React from "react";
import { PathFor } from "../interfaces";
import { State } from "opds-web-client/lib/state";
import { buildCollectionStore } from "opds-web-client/lib/store";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { Store } from "redux";

export interface ContextProviderProps extends React.Props<any> {
  homeUrl: string;
  catalogBase: string;
  initialState?: State;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  pathFor: PathFor;
  recommendationsStore: Store<{ collection: CollectionData }>;

  constructor(props) {
    super(props);
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
    pathFor: React.PropTypes.func.isRequired,
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    initialState: React.PropTypes.object,
    recommendationsStore: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      pathFor: this.pathFor,
      homeUrl: this.props.homeUrl,
      catalogBase: this.props.catalogBase,
      initialState: this.props.initialState,
      recommendationsStore: this.recommendationsStore
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};