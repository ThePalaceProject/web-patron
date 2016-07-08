import * as React from "react";
import { Store } from "redux";
import { PathFor } from "../interfaces";

export interface ContextProviderProps extends React.Props<any> {
  homeUrl: string;
  catalogBase: string;
  proxyUrl?: string;
  store?: Store<any>;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "/web";
      path +=
        collectionUrl ?
        `/collection/${this.prepareCollectionUrl(collectionUrl)}` :
        "";
      path +=
        bookUrl ?
        `/book/${this.prepareBookUrl(bookUrl)}` :
        "";
      path += tab ? `/tab/${tab}` : "";
      return path;
    };
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
    proxyUrl: React.PropTypes.string,
    store: React.PropTypes.object
  };

  getChildContext() {
    return {
      pathFor: this.pathFor,
      homeUrl: this.props.homeUrl,
      catalogBase: this.props.catalogBase,
      proxyUrl: this.props.proxyUrl,
      store: this.props.store
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};