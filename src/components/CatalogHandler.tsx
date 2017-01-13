import * as React from "react";
import * as ReactDOM from "react-dom";
import { State } from "opds-web-client/lib/state";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import Header from "./Header";
import Footer from "./Footer";
import BookDetailsContainer from "./BookDetailsContainer";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import computeBreadcrumbs from "../computeBreadcrumbs";
import AuthPlugin from "opds-web-client/lib/AuthPlugin";

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
  catalogName: string;
  authPlugins: AuthPlugin[];
  shortenUrls: boolean;
  initialState?: State;
}

export default class CatalogHandler extends React.Component<CatalogHandlerProps, any> {
  context: CatalogHandlerContext;

  static contextTypes: React.ValidationMap<CatalogHandlerContext> = {
    homeUrl: React.PropTypes.string.isRequired,
    catalogBase: React.PropTypes.string.isRequired,
    catalogName: React.PropTypes.string.isRequired,
    authPlugins: React.PropTypes.array.isRequired,
    shortenUrls: React.PropTypes.bool.isRequired,
    initialState: React.PropTypes.object
  };

  render() {
    let { collectionUrl, bookUrl } = this.props.params;

    if (this.context.shortenUrls) {
      collectionUrl = expandCollectionUrl(this.context.catalogBase, collectionUrl) || null;
      bookUrl = expandBookUrl(this.context.catalogBase, bookUrl) || null;
    }

    let pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return this.context.catalogName + (details ? " - " + details : "");
    };

    return (
      <OPDSCatalog
        collectionUrl={collectionUrl}
        bookUrl={bookUrl}
        Header={Header}
        Footer={Footer}
        BookDetailsContainer={BookDetailsContainer}
        pageTitleTemplate={pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        authPlugins={this.context.authPlugins}
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