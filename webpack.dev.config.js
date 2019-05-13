const merge = require('webpack-merge');
const common = require('./webpack.common.js');

var config = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
});

module.exports = config;
