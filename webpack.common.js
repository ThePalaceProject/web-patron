const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var webpackConfig = {
  entry: {
    CirculationPatronWeb: [
      "./src/stylesheets/app.scss",
      "./src/index.tsx" ]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  plugins: [
    // jsdom is needed for server rendering, but causes errors
    // in the browser even if it is never used, so we ignore it:
    new webpack.IgnorePlugin(/jsdom$/),

    // Extract separate css file.
    new MiniCssExtractPlugin({ filename: "[name].css" })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg).*$/,
        loader: 'url-loader?limit=100000'
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss"]
  }
};

module.exports = webpackConfig;
