import * as React from 'react'
import { match, RouterContext } from "react-router";
import UrlShortener from "../../UrlShortener";
import buildInitialState, { State } from "opds-web-client/lib/state";
import { renderToString } from "react-dom/server";
import ContextProvider from "../../components/ContextProvider";
import { LibraryData } from "../../interfaces";
import renderErrorPage from './renderErrorPage'
import getAssets, {renderCSS, renderJS} from './getAssets';

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
        const fullPage = await buildPage(collectionUrl, bookUrl, libraryData, shortenUrls, renderProps, res);

        res.status(200).send(fullPage)

      } catch (error) {
        // try to render the homepage, and if you can't then 
        // just send the error page
        try {
          const fullPage = await buildPage(null, null, libraryData, shortenUrls, renderProps, res);

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

const buildPage = async (collectionUrl, bookUrl, libraryData, shortenUrls, renderProps, res) => {
  const state = await buildInitialState(collectionUrl, bookUrl);
  // get the html content

  const assets = await getAssets(res);

  const html = renderToString(
    <ContextProvider
      library={libraryData}
      shortenUrls={shortenUrls}
      initialState={state}>
      <RouterContext {...renderProps} />
    </ContextProvider>
  );

  // put it into your template and return it
  return renderFullPage(html, libraryData, state, shortenUrls, assets)
}


function renderFullPage(html: string, library: LibraryData, preloadedState: State, shortenUrls, assets) {
  const collectionTitle = preloadedState.collection && preloadedState.collection.data && preloadedState.collection.data.title;

  const bookTitle = preloadedState.book && preloadedState.book.data && preloadedState.book.data.title;

  const details = bookTitle || collectionTitle;
  const pageTitle = library.catalogName + (details ? " - " + details : "");
  return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>${pageTitle}</title>
          <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
          ${library.cssLinks.map(link => {
    return `<link href="${link.href}" rel="${link.rel}" crossorigin="anonymous">`;
  }).join("\n")}
          ${renderCSS(assets.CirculationPatronWeb)}
        </head>
        <body>
          <div id="circulation-patron-web">${html}</div>
          ${renderJS(assets.CirculationPatronWeb)}
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







export default ssr