const merge = require("webpack-merge");
const common = require("./webpack.common.js");

var config = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    // hot module replacement
    new webpack.HotModuleReplacementPlugin()
  ],
  entry: {
    // different entrypoint to config hot reloading
    CirculationPatronWeb: [
      "react-hot-loader/patch",
      "./src/index.tsx",
      "webpack-hot-middleware/client",
      "webpack/hot/dev-server"
    ]
  },
  resolve: {
    alias: {
      "react-dom": "@hot-loader/react-dom"
    }
  }
});

module.exports = config;
