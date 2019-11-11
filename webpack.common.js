const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

var webpackConfig = {
  entry: {
    CirculationPatronWeb: [
      "./src/stylesheets/app.scss",
      "./src/index.tsx"]
  },
  output: {
    // where the files will be placed on the filesystem
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd",
    // url where static files like css and js will be
    // made available by express
    publicPath: "/static/"
  },
  plugins: [
    // jsdom is needed for server rendering, but causes errors
    // in the browser even if it is never used, so we ignore it:
    new webpack.IgnorePlugin(/jsdom$/),

    // Extract separate css file.
    new MiniCssExtractPlugin({ filename: "[name].css" }),

    // empty the dist folder on every build.
    new CleanWebpackPlugin(),

    /**
     * Files used to be hard coded into the index.html. Now we
     * do it dynamically since we source them from the filesystem
     * in prod and memory in dev. During dev, we read webpackstats
     * to get the manifest. In prod we generate a manifest file to
     * get a list of the files to include in index.html when
     * rendering
     */
    new ManifestPlugin({
      generate: (seed, files, entrypoints) => entrypoints
    })
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
    extensions: [".ts", ".tsx", ".js", ".scss"],
    alias: {
      react: path.resolve('./node_modules/react')
    },
  },

};

module.exports = webpackConfig;
