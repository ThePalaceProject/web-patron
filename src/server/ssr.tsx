import * as React from 'react'
import { match, RouterContext } from "react-router";
import UrlShortener from "../UrlShortener";
import buildInitialState, { State } from "opds-web-client/lib/state";
import { renderToString } from "react-dom/server";
import ContextProvider from "../components/ContextProvider";
import { LibraryData } from "../interfaces";

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
 }) => (req, res) => {
   console.log(routes, req.url)
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

        buildInitialState(collectionUrl, bookUrl).then((state: State) => {

          const html = renderToString(
            <ContextProvider
              library={libraryData}
              shortenUrls={shortenUrls}
              initialState={state}>
              <RouterContext {...renderProps} />
            </ContextProvider>
          );

          res.status(200).send(renderFullPage(html, libraryData, state, shortenUrls));

        }).catch(err => {
          console.error(err)
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

            res.status(200).send(renderFullPage(html, libraryData, state, shortenUrls));

          }).catch(err => {
            console.error(err)
            res.status(500).send(renderErrorPage())
          });

        });

      } else {
        // no route matched to the url, so send a 404
        res.status(404).send(renderErrorPage("This page doesn't exist."));

      }
    });
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



export default ssr