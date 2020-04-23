const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const OUTPUT_PATH = path.resolve(__dirname, "./dist");
const PUBLIC_PATH = "/static/";

let webpackConfig = {
  entry: {
    CirculationPatronWeb: ["./src/index.tsx"]
  },
  output: {
    // where the files will be placed on the filesystem
    path: OUTPUT_PATH,
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd",
    // url where static files like css and js will be
    // made available by express
    publicPath: PUBLIC_PATH
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

    // pass our environment variables through to the front end.
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      CONFIG_FILE: null,
      SIMPLIFIED_CATALOG_BASE: null,
      REGISTRY_BASE: null,
      SHORTEN_URLS: true,
      AXE_TEST: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        exclude: [/node_modules/],
        use: {
          loader: "babel-loader",
          options: {
            babelrc: true,
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
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
              reloadAll: true
            }
          },
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf).*$/,
        loader: "url-loader?limit=100000"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss"],
    alias: {
      react: path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom"),
      "react-redux": path.resolve("./node_modules/react-redux")
    }
  }
};

module.exports = webpackConfig;
