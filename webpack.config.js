var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var theme = process.env.THEME || "./src/stylesheets/app.scss";

var config = {
  entry: {
    app: [ theme, "./src/index.tsx" ]
  },
  output: {
    path: "./dist",
    filename: "circulation-patron-web.js",
    library: "CirculationPatronWeb",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
    // jsdom is needed for server rendering, but causes errors
    // in the browser even if it is never used, so we ignore it:
    new webpack.IgnorePlugin(/jsdom$/),

    // Extract separate css file.
    new ExtractTextPlugin("circulation-patron-web.css")
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

module.exports = config;