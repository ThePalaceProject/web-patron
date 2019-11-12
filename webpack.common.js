const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

let webpackConfig = {
  entry: {
    CirculationPatronWeb: [
      "react-hot-loader/patch",
      "./src/stylesheets/app.scss",
      "./src/index.tsx",
      "webpack-hot-middleware/client",
      "webpack/hot/dev-server"
    ]
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
    }),

    /**
     *  since we now use babel instead of ts-loader,
     *  we need to use this to check ts.
     */
    new ForkTsCheckerWebpackPlugin(),

    // hot module replacement
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        exclude: [/node_modules/],
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              [
                "@babel/preset-env",
                { targets: { browsers: "last 2 versions" } }, // or whatever your project requires
              ],
              "@babel/preset-typescript",
              "@babel/preset-react",
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              // ['@babel/plugin-proposal-decorators', { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              "react-hot-loader/babel",
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // only enable hot in development
              hmr: process.env.NODE_ENV === "development",
              // if hmr does not work, this is a forceful method.
              reloadAll: true,
            },
          },
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg).*$/,
        loader: "url-loader?limit=100000"
      }
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss"],
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": "@hot-loader/react-dom",
    },
  },

};

module.exports = webpackConfig;
