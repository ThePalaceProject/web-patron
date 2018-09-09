import "../ignore_stylesheet_imports";
import * as express from "express";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import { singleLibraryRoutes, multiLibraryRoutes } from "../routes";
import ContextProvider from "../components/ContextProvider";
import buildInitialState, { State } from "opds-web-client/lib/state";
import Registry from "./Registry";
import UrlShortener from "../UrlShortener";
import { LibraryData } from "../interfaces";

const app = express();
const port = process.env.PORT || 3000;

const registryBase = process.env.REGISTRY_BASE || "http://localhost:7000";

const circManagerBase = process.env.SIMPLIFIED_CATALOG_BASE;
const circManagerName = process.env.SIMPLIFIED_CATALOG_NAME;
let routes = (circManagerBase && circManagerName) ? singleLibraryRoutes : multiLibraryRoutes;

const shortenUrls: boolean = !!process.env.SHORTEN_URLS;

const distDir = process.env.SIMPLIFIED_PATRON_DIST || "dist";
const registryExpirationSeconds = process.env.REGISTRY_EXPIRATION_SECONDS;
const registry = new Registry(registryBase, registryExpirationSeconds);

// This is fired every time the server side receives a request
app.use("/js", express.static(distDir));
app.use("/css", express.static(distDir));
app.use(handleRender);

function handleRender(req, res) {
  match({ routes, location: req.url }, async (error, redirectLocation, renderProps: any) => {
    if (error) {
      res.status(500).send(renderErrorPage());
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      let { library, collectionUrl, bookUrl } = renderProps.params;

      let libraryData;
      if (circManagerBase && circManagerName) {
        // We're using a single circ manager library instead of a registry.
        let authDocument = await registry.getAuthDocument(
          { links: [{ rel: "http://opds-spec.org/catalog", href: circManagerBase }] }
        );
        libraryData = {
          onlyLibrary: true,
          catalogUrl: circManagerBase,
          catalogName: circManagerName,
          ...registry.getDataFromAuthDocument(authDocument)
        };
      } else {
        try {
          libraryData = await registry.getLibraryData(library);
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

      buildInitialState(collectionUrl, bookUrl).then((state: State) => {
        const html = renderToString(
          <ContextProvider
            library={libraryData}
            shortenUrls={shortenUrls}
            initialState={state}>
            <RouterContext {...renderProps} />
          </ContextProvider>
        );
        res.status(200).send(renderFullPage(html, libraryData, state));
      }).catch(err => {
        // if error, render catalog root
        buildInitialState(null, null).then((state: State) => {
          const html = renderToString(
            <ContextProvider
              library={libraryData}
              shortenUrls={shortenUrls}
              initialState={state}>
              <RouterContext {...renderProps} />
            </ContextProvider>
          );
          res.status(200).send(renderFullPage(html, libraryData, state));
        }).catch(err => res.status(500).send(renderErrorPage()));
      });
    } else {
      res.status(404).send(renderErrorPage("This page doesn't exist."));
    }
  });
}

function renderFullPage(html: string, library: LibraryData, preloadedState: State) {
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

app.listen(port, function() {
  console.log("Server listening on port " + port);
});