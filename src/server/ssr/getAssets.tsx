import * as React from "react";
import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import * as express from "express";
import * as _ from "lodash";
import isDevelopment from "../isDevelopment";
const webpackConfig = isDevelopment
  ? require("../../../webpack.dev.config.js")
  : require("../../../webpack.prod.config.js");
/**
 * Assets are the files we need to link to in our HTML,
 * like css and js files. Where we get them now depends
 * on whether we are in development (memory) or in production
 * (filesystem).
 */

const existsP = util.promisify(fs.exists);

function getAssets(res: express.Response) {
  // when in development, get assets from webpackStats
  if (isDevelopment && res.locals.webpackStats) {
    const assets = res.locals.webpackStats.toJson().assetsByChunkName;
    return Promise.resolve(assets);
  }

  // otherwise we are in production, and we get our assets
  // from the public folder.
  const manifestPath = webpackConfig.output.path + "/manifest.json";
  return existsP(manifestPath).then(exists => {
    let assets = {};
    if (exists) {
      assets = require(manifestPath);
    }
    return Promise.resolve(assets);
  });
}

// make sure the assets are an array
function normalizeAssets(assets: string | string[]) {
  return Array.isArray(assets) ? assets : [assets];
}

const publicPath = webpackConfig.output.publicPath;

export function renderJS(asset: string | string[]) {
  return (
    normalizeAssets(asset)
      // get just the js bits
      .filter(path => _.endsWith(path, ".js"))
      // put it into a script tag
      .map(path => (
        <script key={path} type="text/javascript" src={publicPath + path} />
      ))
  );
}

export function renderCSS(asset: string | string[]) {
  return (
    normalizeAssets(asset)
      // get just the css bits
      .filter(path => _.endsWith(path, ".css"))
      // put it into a link
      .map(path => (
        <link key={path} rel="stylesheet" href={publicPath + path} />
      ))
  );
}

export default getAssets;
