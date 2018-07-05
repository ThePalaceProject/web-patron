var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var fs = require("fs");

var appConfigFile = process.env.CONFIG;
var appConfig;

if (appConfigFile) {
  appConfig = JSON.parse(fs.readFileSync(appConfigFile));
} else {
  appConfig = {};
}
var theme = appConfig.theme || "./src/stylesheets/app.scss";
var authPlugins = appConfig.authPlugins || {};

var webpackConfig = {
  entry: Object.assign({
    CirculationPatronWeb: [ theme, "./src/index.tsx" ]
  }, authPlugins),
  output: {
    path: "./dist",
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
    // jsdom is needed for server rendering, but causes errors
    // in the browser even if it is never used, so we ignore it:
    new webpack.IgnorePlugin(/jsdom$/),

    // Extract separate css file. This will also create css files for the auth entry points,
    // which can be ignored.
    new ExtractTextPlugin("[name].css"),

    // This puts all shared modules into CirculationPatronWeb.js, so the auth js files won't
    // have extra copies of react.
    new webpack.optimize.CommonsChunkPlugin({
      name: "CirculationPatronWeb",
      file: "CirculationPatronWeb.js"
    })
  ],
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader'
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg).*$/,
        loader: 'url-loader?limit=100000'
      }
    ],
  },
  resolve: {
    extensions: ["", ".js", ".ts", ".tsx", ".scss"],
    root: path.resolve(__dirname, "node_modules")
  }
};

module.exports = webpackConfig;
