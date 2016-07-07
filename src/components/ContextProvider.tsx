import * as React from "react";
import { PathFor } from "../interfaces";

export interface ContextProviderProps extends React.Props<any> {
  homeUrl: string;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  pathFor: PathFor;

  constructor(props) {
    super(props);
    this.pathFor = (collectionUrl: string, bookUrl: string, tab?: string) => {
      let path = "/admin/web";
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
      url.replace(document.location.origin + "/", "").replace(/\/$/, "").replace(/^\//, "")
    );
  }

  prepareBookUrl(url: string): string {
    return encodeURIComponent(
      url.replace(document.location.origin + "/works/", "").replace(/\/$/, "").replace(/^\//, "")
    );
  }

  static childContextTypes: React.ValidationMap<any> = {
    pathFor: React.PropTypes.func.isRequired,
    homeUrl: React.PropTypes.string.isRequired,
  };

  getChildContext() {
    return {
      pathFor: this.pathFor,
      homeUrl: this.props.homeUrl,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};