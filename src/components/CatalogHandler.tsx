import * as React from "react";
import * as ReactDOM from "react-dom";
import { State } from "opds-web-client/lib/state";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import Header from "./Header";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import computeBreadcrumbs from "../computeBreadcrumbs";

export interface CatalogHandlerProps extends React.Props<CatalogHandler> {
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

export interface CatalogHandlerContext {
  homeUrl: string;
  catalogBase: string;
  proxyUrl: string;
  initialState?: State;
}

export default class CatalogHandler extends React.Component<CatalogHandlerProps, any> {
  context: CatalogHandlerContext;

  static contextTypes: React.ValidationMap<CatalogHandlerContext> = {
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    proxyUrl: React.PropTypes.string,
    initialState: React.PropTypes.object
  };

  static childContextTypes: React.ValidationMap<any> = {
    tab: React.PropTypes.string
  };

  getChildContext() {
    return {
      tab: this.props.params.tab
    };
  }

  render() {
    let { collectionUrl, bookUrl } = this.props.params;

    collectionUrl =
      expandCollectionUrl(this.context.catalogBase, collectionUrl) ||
      this.context.homeUrl ||
      null;
    bookUrl = expandBookUrl(this.context.catalogBase, bookUrl) || null;

    let pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return "eBook Catalog" + (details ? " - " + details : "");
    };

    return (
      <OPDSCatalog
        collectionUrl={collectionUrl}
        bookUrl={bookUrl}
        Header={Header}
        pageTitleTemplate={pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        proxyUrl={this.context.proxyUrl}
        initialState={this.context.initialState}
        />
    );
  }
}

export function expandCollectionUrl(catalogBase: string, url: string): string {
  return url ?
    catalogBase + "/" + url :
    url;
}

export function expandBookUrl(catalogBase: string, url: string): string {
  return url ?
    catalogBase + "/works/" + url :
    url;
}