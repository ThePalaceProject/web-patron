import * as express from 'express';

/**
 * set up the app to use webpack dev middleware and 
 * compile app in memory
 */

function wdm (app: express.Application) {
  const webpackConfig  = require('../../webpack.dev.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack = require('webpack');

  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    // this is where static files are to go.
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: true,
  }));
  // enable hot reloading next, probably going to have to switch webpack 
  // to use babel for ts compilation
  // app.use(webpackHotMiddleware(compiler));

  // Throw away the cached client modules and let them be re-required next time
  // compiler.plugin('done', () => {
  //   const cacheModules = Object.keys(require.cache)
  //     .filter((id) => /client/.test(id) || /ssr/.test(id));

  //   if (cacheModules.length > 1) {
  //     console.info('===> Client\'s cache has been removed.', `Find ${cacheModules.length}`);
  //     cacheModules.forEach((id) => delete require.cache[id]);
  //   }
  // });
}

export default wdm;