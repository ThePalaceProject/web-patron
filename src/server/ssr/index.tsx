import * as React from 'react'
import * as express from 'express'
// import { match, RouterContext } from "react-router";
import UrlShortener from "../../UrlShortener";
import buildInitialState, { State } from "opds-web-client/lib/state";
import { renderToString } from "react-dom/server";
import ContextProvider from "../../components/ContextProvider";
import { LibraryData } from "../../interfaces";
import renderErrorPage from './renderErrorPage'
import getAssets, { renderCSS, renderJS } from './getAssets';
import Html, { DOCTYPE } from './html'
import { matchPath, StaticRouter, match as Match } from "react-router-dom";
import App from '../../App'

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
 *  - no url match -> home page
 *  - no params on url -> home page
 *  - can't get library data from cache -> home page
 *  - no collectionUrl or bookUrl, we need to redirect -> redirect
 *  - app renders a redirect itself -> redirect
 *  - building the page fails -> error page
 * 
 *  - in order to build a home page, we need library data. Either from the cache
 *  or we build it ourselves
 * 
 *  - 
 */

type Url = string

type Params = {
  library?: string,
  collectionUrl?: Url,
  bookUrl?: Url,
}

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
    )
    // if there is no active route, render the home page
    if (!match) {
      // render home page
      console.error("No route match was found for ", req.url)
    }

    // otherwise, use the params to get the data, then render.
    const { library, collectionUrl, bookUrl } = match.params;

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
    let catalogUrl = libraryData.catalogUrl;

    if (!collectionUrl && !bookUrl) {
      let urlShortener = new UrlShortener(catalogUrl, shortenUrls);
      let preparedCollectionUrl = urlShortener.prepareCollectionUrl(catalogUrl);
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
      res.status(200).send(fullPage)
    } catch (e) {
      const fullPage = await buildPage(null, null, libraryData, shortenUrls, req, res);
      res.status(200).send(fullPage)
    }

  } catch (error) {
    console.error(error)
    res.status(500).send(renderErrorPage())
  }
}

const getLibraryData = () => {
  
}


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

  return DOCTYPE + '\n' +
    renderToString(React.createElement(Html, {
      content: htmlContent,
      library: libraryData,
      preloadedState: state,
      shortenUrls,
      assets
    }))

}

export default ssr