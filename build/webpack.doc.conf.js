const path = require('path')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

module.exports = merge(baseWebpackConfig, {
  entry: path.resolve(__dirname, '../dev/src/index.js'),
  output: {
    path: path.resolve(__dirname, '../docs'),
    publicPath: '',
    filename: 'build.js'
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../dev/src'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json', '.ts']
  }
})
