import * as React from "react";
import buildStore from "../store";
import { PathFor } from "../interfaces";
import { State as CatalogState } from "opds-web-client/lib/state";
import { Store } from "redux";
import { State } from "../reducers";
import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import { HeaderLink } from "../Config";

export interface ContextProviderProps extends React.Props<any> {
  homeUrl: string;
  catalogBase: string;
  catalogName: string;
  appName: string;
  authPlugins: AuthPlugin[];
  headerLinks: HeaderLink[];
  logoLink: string;
  shortenUrls: boolean;
  initialState?: CatalogState;
}

export default class ContextProvider extends React.Component<ContextProviderProps, any> {
  store: Store<State>;
  pathFor: PathFor;

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
  }

  prepareCollectionUrl(url: string): string {
    if (this.props.shortenUrls) {
      url = url.replace(this.props.catalogBase + "/", "").replace(/\/$/, "").replace(/^\//, "");
    }
    return encodeURIComponent(url);
  }

  prepareBookUrl(url: string): string {
    if (this.props.shortenUrls) {
      const regexp = new RegExp(this.props.catalogBase + "/(.*)/works/(.*)");
      const match = regexp.exec(url);
      if (match) {
        const library = match[1];
        const work = match[2];
        return encodeURIComponent(
          library + "/" + work
        );
      }
    }
    return encodeURIComponent(url);
  }

  static childContextTypes: React.ValidationMap<any> = {
    store: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    catalogName: React.PropTypes.string.isRequired,
    appName: React.PropTypes.string.isRequired,
    authPlugins: React.PropTypes.array.isRequired,
    headerLinks: React.PropTypes.array.isRequired,
    logoLink: React.PropTypes.string.isRequired,
    shortenUrls: React.PropTypes.bool.isRequired,
    initialState: React.PropTypes.object
  };

  getChildContext() {
    return {
      store: this.store,
      pathFor: this.pathFor,
      homeUrl: this.props.homeUrl,
      catalogBase: this.props.catalogBase,
      catalogName: this.props.catalogName,
      appName: this.props.appName,
      authPlugins: this.props.authPlugins,
      headerLinks: this.props.headerLinks,
      logoLink: this.props.logoLink,
      shortenUrls: this.props.shortenUrls,
      initialState: this.props.initialState
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};