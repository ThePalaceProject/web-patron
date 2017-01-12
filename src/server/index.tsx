import "../ignore_stylesheet_imports";
import * as express from "express";
import * as fs from "fs";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import routes from "../routes";
import ContextProvider from "../components/ContextProvider";
import { expandCollectionUrl, expandBookUrl } from "../components/CatalogHandler";
import buildInitialState, { State } from "opds-web-client/lib/state";
import Config from "../Config";

const app = express();
const port = process.env.PORT || 3000;
const configFile = process.env.CONFIG;

let config: Config = {};

if (configFile) {
  config = JSON.parse(fs.readFileSync(configFile, "utf8"));
}

const homeUrl = "/" + encodeURIComponent(config.homeUrl || "groups");
const catalogBase = config.catalogBase || "http://circulation.alpha.librarysimplified.org";
const catalogName = config.catalogName || "Books";
const appName = config.appName || "";
const distDir = process.env.SIMPLIFIED_PATRON_DIST || "dist";
const authPlugins = Object.keys(config.authPlugins || {});
const headerLinks = config.headerLinks || [];
const logoLink = config.logoLink || "";
const shortenUrls = config.shortenUrls !== undefined ? config.shortenUrls : true;

const authPluginJsTags = authPlugins.map(plugin => {
  return `<script src="/js/${plugin}.js"></script>\n`;
}).join("");

// This is fired every time the server side receives a request
app.use("/js", express.static(distDir));
app.use("/css", express.static(distDir));
app.use(handleRender);

function handleRender(req, res) {
  match({ routes, location: req.url }, (error, redirectLocation, renderProps: any) => {
    if (error) {
      res.status(500).send(renderErrorPage());
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      let { collectionUrl, bookUrl } = renderProps.params;
      if (shortenUrls) {
        collectionUrl = expandCollectionUrl(catalogBase, collectionUrl);
        bookUrl = expandBookUrl(catalogBase, bookUrl);
      }

      if (!collectionUrl && !bookUrl) {
        res.redirect(302, "/collection" + homeUrl);
        return;
      }

      buildInitialState(collectionUrl, bookUrl).then((state: State) => {
        const html = renderToString(
          <ContextProvider
            homeUrl={homeUrl}
            catalogBase={catalogBase}
            catalogName={catalogName}
            appName={appName}
            authPlugins={[]}
            headerLinks={headerLinks}
            logoLink={logoLink}
            shortenUrls={shortenUrls}
            initialState={state}>
            <RouterContext {...renderProps} />
          </ContextProvider>
        );
        res.status(200).send(renderFullPage(html, state));
      }).catch(err => {
        // if error, render catalog root
        buildInitialState(null, null).then((state: State) => {
          const html = renderToString(
            <ContextProvider
              homeUrl={homeUrl}
              catalogBase={catalogBase}
              catalogName={catalogName}
              appName={appName}
              authPlugins={[]}
              headerLinks={headerLinks}
              logoLink={logoLink}
              shortenUrls={shortenUrls}
              initialState={state}>
              <RouterContext {...renderProps} />
            </ContextProvider>
          );
          res.status(200).send(renderFullPage(html, state));
        }).catch(err => res.status(500).send(renderErrorPage()));
      });
    } else {
      res.status(404).send(renderErrorPage("This page doesn't exist."));
    }
  });
}

function renderFullPage(html: string, preloadedState: State) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <title>${catalogName}</title>
        <link href="/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        <link href="/css/CirculationPatronWeb.css" rel="stylesheet" crossorigin="anonymous">
      </head>
      <body>
        <div id="circulation-patron-web">${html}</div>
        <script src="/js/CirculationPatronWeb.js"></script>
        ${authPluginJsTags}
        <script>
          var circulationPatronWeb = new CirculationPatronWeb({
            homeUrl: "${homeUrl}",
            catalogBase: "${catalogBase}",
            catalogName: "${catalogName}",
            appName: "${appName}",
            authPlugins: [${authPlugins}],
            headerLinks: ${JSON.stringify(headerLinks)},
            logoLink: "${logoLink}",
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
        <title>${catalogName}</title>
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