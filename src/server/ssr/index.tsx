import * as React from "react";
import * as express from "express";
// import { match, RouterContext } from "react-router";
import UrlShortener from "../../UrlShortener";
import buildInitialState, { State } from "opds-web-client/lib/state";
import { renderToString } from "react-dom/server";
import ContextProvider from "../../components/ContextProvider";
import { LibraryData } from "../../interfaces";
import renderErrorPage from "./renderErrorPage";
import getAssets from "./getAssets";
import Html, { DOCTYPE } from "./html";
import { matchPath, StaticRouter, match as Match } from "react-router-dom";
import App from "../../App";

/**
 * A function that takes in library data and returns a function to
 * render html from the request.
 *
 *  - match with a route
 *  - handle 404s, redirects
 *  - get library data
 *  - build initial state
 *  - render the html and send it
 *  - handle errors
 */

/**
 * Possibilities
 *  - no url match
 *  - no params on url
 *  - can't get library data from cache
 *  - no collectionUrl or bookUrl, we need to redirect
 *  - app renders a redirect itself
 *  - building the page fails
 */

type Url = string;

type Params = {
  library?: string
  collectionUrl?: Url
  bookUrl?: Url
};

const ssr = ({
  shortenUrls,
  cache,
  routes,
  circManagerBase
}) => async (req: express.Request, res: express.Response) => {
  // try to match the page and build it
  try {
    // match with the central route config
    let match: Match<Params> | undefined;
    const activeRoute = routes.find(
      (route) => match = matchPath(req.url, route)
    );
    // if there is no active route, render the home page
    if (!match) {
      // render home page
      console.error("No route match was found for ", req.url);
    }

    // otherwise, use the params to get the data, then render.
    // accessing these with typscript optional chaining.
    const library = match?.params?.library;
    const collectionUrl = match?.params?.collectionUrl;
    const bookUrl = match?.params?.bookUrl;

    /**
     * Build out libraryData
     * Send 404 if we fail to get it from the cache
     */
    let libraryData: LibraryData;
    if (circManagerBase) {
      // We're using a single circ manager library instead of a registry.
      let catalog = await cache.getCatalog(circManagerBase);
      let authDocument = await cache.getAuthDocument(catalog);
      libraryData = {
        onlyLibrary: true,
        catalogUrl: circManagerBase,
        ...cache.getDataFromAuthDocumentAndCatalog(authDocument, catalog)
      };
    } else {
      try {
        libraryData = await cache.getLibraryData(library);
      } catch (error) {
        res.status(404).send(renderErrorPage(error));
        return;
      }
    }
    const catalogUrl = libraryData.catalogUrl;

    /**
     * Redirect if there is neither a collectionUrl or a bookUrl
     */
    if (!collectionUrl && !bookUrl) {
      const urlShortener = new UrlShortener(catalogUrl, shortenUrls);
      const preparedCollectionUrl = urlShortener.prepareCollectionUrl(catalogUrl);
      // With short URLS, if the home URL is the library root URL, the prepared URL
      // will be empty, and we don't need to redirect.
      if (!shortenUrls || preparedCollectionUrl) {
        if (library) {
          res.redirect(302, "/" + library + "/collection/" + preparedCollectionUrl);
        } else {
          res.redirect(302, "/collection/" + preparedCollectionUrl);
        }
        return;
      }
    }

    // build the page and send it
    try {
      const fullPage = await buildPage(collectionUrl, bookUrl, libraryData, shortenUrls, req, res);
      res.status(200).send(fullPage);
    } catch (e) {
      const fullPage = await buildPage(null, null, libraryData, shortenUrls, req, res);
      res.status(200).send(fullPage);
    }

  } catch (error) {
    console.error(error);
    res.status(500).send(renderErrorPage());
  }
};

const buildPage = async (collectionUrl: Url, bookUrl: Url, libraryData: LibraryData, shortenUrls, req: express.Request, res: express.Response) => {
  const state = await buildInitialState(collectionUrl, bookUrl);

  const assets = await getAssets(res);

  const context = {};

  const htmlContent: string = renderToString(
    <StaticRouter location={req.url} context={context}>
      <ContextProvider
        library={libraryData}
        shortenUrls={shortenUrls}
        initialState={state}>
        <App />
      </ContextProvider>
    </StaticRouter>
  );

  return DOCTYPE + "\n" +
    renderToString(React.createElement(Html, {
      content: htmlContent,
      library: libraryData,
      preloadedState: state,
      shortenUrls,
      assets
    }));

};

export default ssr;