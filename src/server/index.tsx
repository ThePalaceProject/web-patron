import "../ignore_stylesheet_imports";
import * as express from "express";
import * as React from "react";
import webpackDevMiddleware from './wdm'
import ssr from './ssr'
import getData from './getData'

const isDevelopment = process.env.NODE_ENV === 'development';

const initialize = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  /**
   * Get library data
   */
  const data = await getData()
  const { 
    distDir } = data
  
  /**
   * if we are in development, use webpack dev middleware,
   * otherwise we serve the js and css files with express.static
   */
  if (isDevelopment) {
    /**
     * This will build the app files with webpack and the next
     * middleware wont be invoked until it's finished.
     */
    webpackDevMiddleware(app);
  } else {
    /**
     * tell express where to get files and how to handle all requests
     * This is fired every time the server side receives a request
     * 
     * Instead of telling the app to serve js and css from distDir,
     * maybe we just have a "public folder" and tell the app to serve
     * that using express static:
     * app.use(config.PUBLIC_PATH, express.static(config.PUBLIC_FOLDER));
     */
    app.use("/js", express.static(distDir));
    app.use("/css", express.static(distDir));
  }
  // any request not handled previously will get served html via ssr.
  app.use(ssr(data));

  app.listen(port, function () {
    console.log("Server listening on port " + port);
  });
};
initialize();


