const path = require("path");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");

module.exports = merge(baseWebpackConfig, {
  entry: path.resolve(__dirname, "../dev/src/index.js"),
  output: {
    path: path.resolve(__dirname, "../dev/dist"),
    publicPath: "dist/",
    filename: "build.js"
  },
  devServer: {
    contentBase: path.resolve(__dirname, "../dev"),
    compress: true,
    port: 3000,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: true,
      modules: false,
      publicPath: true,
      timings: false,
      version: true,
      warnings: true,
      colors: {
        green: "\u001b[32m"
      }
    }
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../dev/src'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json', ".ts"]
  },
})
