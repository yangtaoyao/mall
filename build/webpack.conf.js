'use strict'
const path = require('path')

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},

    // Dev Server settings
    host: '127.0.0.1',
    port: 8081,

    // Source Maps
    devtool: 'cheap-module-eval-source-map'
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/admin/',

    // Source Maps
    productionSourceMap: true,
    devtool: '#source-map'
  }
}
