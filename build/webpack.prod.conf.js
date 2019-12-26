const path = require("path")
const merge = require("webpack-merge")
const baseWebpackConfig = require("./webpack.base.conf")

module.exports = merge(baseWebpackConfig, {
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "dist/",
    libraryTarget: 'umd',
    umdNamedDefine: true,
    filename: 'index.min.js'
  },
  devtool: ''
})
