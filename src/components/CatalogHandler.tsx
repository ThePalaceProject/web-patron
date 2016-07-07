import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
const OPDSCatalog = require("opds-web-client");
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { ComputeBreadcrumbs } from "opds-web-client/lib/components/Breadcrumbs";
import computeBreadcrumbs from "../computeBreadcrumbs";

export interface CatalogHandlerProps extends React.Props<CatalogHandler> {
  csrfToken: string;
  params: {
    collectionUrl: string;
    bookUrl: string;
    tab: string;
  };
}

export interface CatalogHandlerContext {
  homeUrl: string;
}

export default class CatalogHandler extends React.Component<CatalogHandlerProps, any> {
  context: CatalogHandlerContext;

  static contextTypes: React.ValidationMap<CatalogHandlerContext> = {
    homeUrl: React.PropTypes.string.isRequired
  };

  static childContextTypes: React.ValidationMap<any> = {
    tab: React.PropTypes.string
  };

  getChildContext() {
    return {
      tab: this.props.params.tab
    };
  }

  expandCollectionUrl(url: string): string {
    return url ?
      document.location.origin + "/" + url :
      url;
  }

  expandBookUrl(url: string): string {
    return url ?
      document.location.origin + "/works/" + url :
      url;
  }

  render() {
    let { collectionUrl, bookUrl } = this.props.params;

    collectionUrl =
      this.expandCollectionUrl(collectionUrl) ||
      this.context.homeUrl ||
      null;
    bookUrl = this.expandBookUrl(bookUrl) || null;

    let pageTitleTemplate = (collectionTitle, bookTitle) => {
      let details = bookTitle || collectionTitle;
      return "Circulation Manager" + (details ? " - " + details : "");
    };

    return (
      <OPDSCatalog
        collectionUrl={collectionUrl}
        bookUrl={bookUrl}
        pageTitleTemplate={pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        />
    );
  }
}