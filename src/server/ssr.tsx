import * as React from 'react'
import * as express from 'express';
import { match, RouterContext } from "react-router";
import UrlShortener from "../UrlShortener";
import buildInitialState, { State } from "opds-web-client/lib/state";
import { renderToString } from "react-dom/server";
import ContextProvider from "../components/ContextProvider";
import { LibraryData } from "../interfaces";
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

/**
 * Should work this way: 
 *  - take in some data 
 *  - match with a route, handle 404 and redirect
 *  - get actual library data
 *  - get the assets
 *  - render the html in a react component
 *  - if there is an error, render the homepage
 *  - if there is an error there, render the error page
 *  - wrap everything in async middleware that will catch uncaught async errors
 */

/**
 * A function that takes in library data and returns a function to
 * render html from the request 
 * 
 * refactor this to extract the getting of library data even further.
 * it should just take data in and perform the render.
 */

const ssr = ({
  shortenUrls,
  cache,
  routes,
  circManagerBase
}) => async (req, res) => {
  match({ routes, location: req.url }, async (error, redirectLocation, renderProps: any) => {
    // handle errors and redirections
    if (error) {
      res.status(500).send(renderErrorPage());
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      // the location matched to the url, so render
      const { library, collectionUrl, bookUrl } = renderProps.params;

      let libraryData;
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

      try {
        // build the page and send it
        const fullPage = await buildPage(collectionUrl, bookUrl, libraryData, shortenUrls, renderProps);

        res.status(200).send(fullPage)

      } catch (error) {
        // try to render the homepage, and if you can't then 
        // just send the error page
        try {
          const fullPage = await buildPage(null, null, libraryData, shortenUrls, renderProps);

          res.status(200).send(fullPage)

        } catch (error) {
          console.error(error)
          res.status(500).send(renderErrorPage())
        }
      }

    } else {
      // no route matched to the url, so send a 404
      res.status(404).send(renderErrorPage("This page doesn't exist."));

    }
  });
}

const buildPage = async (collectionUrl, bookUrl, libraryData, shortenUrls, renderProps) => {
  const state = await buildInitialState(collectionUrl, bookUrl);
  // get the html content
  const html = renderToString(
    <ContextProvider
      library={libraryData}
      shortenUrls={shortenUrls}
      initialState={state}>
      <RouterContext {...renderProps} />
    </ContextProvider>
  );

  // put it into your template and return it
  return renderFullPage(html, libraryData, state, shortenUrls)
}


function renderFullPage(html: string, library: LibraryData, preloadedState: State, shortenUrls) {
  let collectionTitle = preloadedState.collection && preloadedState.collection.data && preloadedState.collection.data.title;

  let bookTitle = preloadedState.book && preloadedState.book.data && preloadedState.book.data.title;

  let details = bookTitle || collectionTitle;
  let pageTitle = library.catalogName + (details ? " - " + details : "");

  return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>${pageTitle}</title>
          <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
          <link href="/css/CirculationPatronWeb.css" rel="stylesheet" crossorigin="anonymous">
          ${library.cssLinks.map(link => {
    return `<link href="${link.href}" rel="${link.rel}" crossorigin="anonymous">`;
  }).join("\n")}
        </head>
        <body>
          <div id="circulation-patron-web">${html}</div>
          <script src="/js/CirculationPatronWeb.js"></script>
          <script>
            var circulationPatronWeb = new CirculationPatronWeb({
              library: ${JSON.stringify(library)},
              shortenUrls: ${shortenUrls},
              initialState: ${JSON.stringify(preloadedState)}
            });
          </script>
        </body>
      </html>
      `;
}

function renderErrorPage(message: string = "There was a problem with this request.") {
  return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>Error</title>
          <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
          <div style="text-align: center; margin-top: 200px;">
            <h1>${message}</h1>
            <br />
            <h3><a class="btn btn-lg btn-primary" href="/">Home Page</a></h3>
          </div>
        </body>
      </html>
      `;
}

const existsP = util.promisify(fs.exists);
/**
 * A function to get the css and js etc depending on
 * whether running in dev or prod. In dev it comes from webpackStats
 * and in prod it comes from fs.
 */
function getAssets(res: express.Response) {
  if (process.env.NODE_ENV === 'development' && res.locals.webpackStats) {
    const assets = res.locals.webpackStats.toJson().assetsByChunkName;
    return Promise.resolve(assets);
  }

  const assetsPath = path.join(config.PUBLIC_FOLDER, 'manifest.json');

  return existsP(assetsPath)
    .then((exists) => {
      let assets = {};
      if (exists) {
        assets = require(assetsPath);
      }

      return Promise.resolve(assets);
    });
}

function normalizeAssets(assets: string | string[]) {
  return Array.isArray(assets) ? assets : [assets];
}

function renderJS(asset: string | string[]) {
  return this.normalizeAssets(asset)
    .filter((path) => _.endsWith(path, '.js'))
    .map((path, key) => <script key={key} type='text/javascript' src={this.props.publicPath + path} />);
}

function renderCSS(asset: string | string[]) {
  return this.normalizeAssets(asset)
    .filter((path) => _.endsWith(path, '.css'))
    .map((path, key) => <link key={key} rel='stylesheet' href={this.props.publicPath + path} />);
}




export default ssr