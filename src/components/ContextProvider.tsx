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
    store: React.PropTypes.object.isRequired,
    pathFor: React.PropTypes.func.isRequired,
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    catalogName: React.PropTypes.string.isRequired,
    appName: React.PropTypes.string.isRequired,
    authPlugins: React.PropTypes.array.isRequired,
    headerLinks: React.PropTypes.array.isRequired,
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
      initialState: this.props.initialState
    };
  }

  render() {
    return React.Children.only(this.props.children);
  };
};