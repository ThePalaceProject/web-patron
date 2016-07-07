var webpack = require("webpack");
var path = require("path");

var config = {
  entry: {
    app: [ "./src/index.tsx" ]
  },
  output: {
    path: "./dist",
    filename: "circulation-patron-web.js",
    library: "CirculationPatronWeb",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) })
  ],
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader'
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg).*$/,
        loader: 'url-loader?limit=100000'
      }
    ],
  },
  resolve: {
    extensions: ["", ".js", ".ts", ".tsx"],
    root: path.resolve(__dirname, "node_modules")
  }
};

module.exports = config;