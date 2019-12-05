import * as React from "react";
import * as tinycolor from "tinycolor2";
const OPDSCatalog = require("opds-web-client");
import Header from "./Header";
import Footer from "./Footer";
import BookDetailsContainer from "./BookDetailsContainer";
import computeBreadcrumbs from "../computeBreadcrumbs";
import { LibraryData } from "../interfaces";
import BasicAuthWithButtonImagePlugin from "../auth/BasicAuthWithButtonImagePlugin";
import OAuthPlugin from "../auth/OAuthPlugin";
import Layout from "./Layout";
import { useParams } from "react-router-dom";
import UrlShortenerContext from "./context/UrlShortenerContext";
import LibraryContext from "./context/LibraryContext";
import InitialStateContext from "./context/InitialStateContext";

const CatalogHandler = () => {
  const { collectionUrl, bookUrl } = useParams();
  const urlShortener = React.useContext(UrlShortenerContext);
  const library = React.useContext(LibraryContext);
  const initialState = React.useContext(InitialStateContext);

  const pageTitleTemplate = (collectionTitle, bookTitle) => {
    const details = bookTitle || collectionTitle;
    return library.catalogName + (details ? " - " + details : "");
  };

  const expandedCollectionUrl =
    urlShortener.expandCollectionUrl(collectionUrl) || null;
  const expandedBookUrl = urlShortener.expandBookUrl(bookUrl) || null;

  const cssVariables = getCssVars(library);

  return (
    <div style={cssVariables}>
      <OPDSCatalog
        collectionUrl={collectionUrl}
        bookUrl={bookUrl}
        Header={Header}
        Footer={Footer}
        BookDetailsContainer={BookDetailsContainer}
        pageTitleTemplate={pageTitleTemplate}
        computeBreadcrumbs={computeBreadcrumbs}
        initialState={initialState}
        authPlugins={[BasicAuthWithButtonImagePlugin, OAuthPlugin]}
      />
      {/* <Layout /> */}
    </div>
  );
};

const getCssVars = (library: LibraryData) => {
  const cssVariables = {};
  if (library.logoUrl) {
    cssVariables["--logo"] = `url('${library.logoUrl}')`;
  }
  const background = tinycolor(
    (library.colors && library.colors.background) || "#ffffff"
  );
  const foreground = tinycolor(
    (library.colors && library.colors.foreground) || "#000000"
  );

  cssVariables["--pagecolor"] = background.toString();
  if (background.isLight()) {
    cssVariables["--pagecolorlight"] = background
      .clone()
      .darken(2)
      .toString();
    cssVariables["--footercolor"] = background
      .clone()
      .darken(2)
      .toString();
  } else {
    cssVariables["--pagecolorlight"] = background
      .clone()
      .lighten(2)
      .toString();
    cssVariables["--footercolor"] = background
      .clone()
      .lighten(2)
      .toString();
  }
  background.setAlpha(0.5);
  cssVariables["--transparentpagecolor"] = background.toString();
  background.setAlpha(0.9);
  cssVariables["--semitransparentpagecolor"] = background.toString();

  cssVariables["--linkcolor"] = foreground.toString();
  if (foreground.isDark()) {
    cssVariables["--linkvisitedcolor"] = foreground
      .clone()
      .lighten(20)
      .toString();
    cssVariables["--linkhovercolor"] = foreground
      .clone()
      .lighten(10)
      .toString();
    cssVariables["--pagetextcolor"] = foreground
      .clone()
      .desaturate(10)
      .toString();
    cssVariables["--pagetextcolorlight"] = foreground
      .clone()
      .desaturate(10)
      .darken(25)
      .toString();
    cssVariables["--highlightcolor"] = foreground
      .clone()
      .desaturate(10)
      .toString();
  } else {
    cssVariables["--linkvisitedcolor"] = foreground
      .clone()
      .darken(20)
      .toString();
    cssVariables["--linkhovercolor"] = foreground
      .clone()
      .darken(10)
      .toString();
    cssVariables["--pagetextcolor"] = foreground
      .clone()
      .desaturate(10)
      .toString();
    cssVariables["--pagetextcolorlight"] = foreground
      .clone()
      .desaturate(10)
      .lighten(25)
      .toString();
    cssVariables["--highlightcolor"] = foreground
      .clone()
      .desaturate(10)
      .toString();
  }
  return cssVariables;
};

export default CatalogHandler;

// export default class CatalogHandler extends React.Component<CatalogHandlerProps, any> {

//   render() {
//     // these come from the url via router
//     let { params: { collectionUrl, bookUrl } } = this.props.match;

//     let pageTitleTemplate = (collectionTitle, bookTitle) => {
//       let details = bookTitle || collectionTitle;
//       return this.context.library.catalogName + (details ? " - " + details : "");
//     };

//     collectionUrl = this.context.urlShortener.expandCollectionUrl(collectionUrl) || null;
//     bookUrl = this.context.urlShortener.expandBookUrl(bookUrl) || null;

//     let cssVariables = {};
//     if (this.context.library.logoUrl) {
//       cssVariables["--logo"] = `url('${this.context.library.logoUrl}')`;
//     }
//     let background = tinycolor((this.context.library.colors && this.context.library.colors.background) || "#ffffff");
//     let foreground = tinycolor((this.context.library.colors && this.context.library.colors.foreground) || "#000000");

//     cssVariables["--pagecolor"] = background.toString();
//     if (background.isLight()) {
//       cssVariables["--pagecolorlight"] = background.clone().darken(2).toString();
//       cssVariables["--footercolor"] = background.clone().darken(2).toString();
//     } else {
//       cssVariables["--pagecolorlight"] = background.clone().lighten(2).toString();
//       cssVariables["--footercolor"] = background.clone().lighten(2).toString();
//     }
//     background.setAlpha(0.5);
//     cssVariables["--transparentpagecolor"] = background.toString();
//     background.setAlpha(0.9);
//     cssVariables["--semitransparentpagecolor"] = background.toString();

//     cssVariables["--linkcolor"] = foreground.toString();
//     if (foreground.isDark()) {
//       cssVariables["--linkvisitedcolor"] = foreground.clone().lighten(20).toString();
//       cssVariables["--linkhovercolor"] = foreground.clone().lighten(10).toString();
//       cssVariables["--pagetextcolor"] = foreground.clone().desaturate(10).toString();
//       cssVariables["--pagetextcolorlight"] = foreground.clone().desaturate(10).darken(25).toString();
//       cssVariables["--highlightcolor"] = foreground.clone().desaturate(10).toString();
//     } else {
//       cssVariables["--linkvisitedcolor"] = foreground.clone().darken(20).toString();
//       cssVariables["--linkhovercolor"] = foreground.clone().darken(10).toString();
//       cssVariables["--pagetextcolor"] = foreground.clone().desaturate(10).toString();
//       cssVariables["--pagetextcolorlight"] = foreground.clone().desaturate(10).lighten(25).toString();
//       cssVariables["--highlightcolor"] = foreground.clone().desaturate(10).toString();
//     }

//     return (
//       <div style={cssVariables}>
//         {/* <OPDSCatalog
//           collectionUrl={collectionUrl}
//           bookUrl={bookUrl}
//           Header={Header}
//           Footer={Footer}
//           BookDetailsContainer={BookDetailsContainer}
//           pageTitleTemplate={pageTitleTemplate}
//           computeBreadcrumbs={computeBreadcrumbs}
//           initialState={this.context.initialState}
//           authPlugins={[BasicAuthWithButtonImagePlugin, OAuthPlugin]}
//         /> */}
//         <Layout />
//       </div>
//     );
//   }
// }

// CatalogHandler.contextType = AppContext
