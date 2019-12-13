const path = require('path')
const resolve = (dir) => {
  return path.join(__dirname, dir)
}

module.exports = {
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    },
  },
  productionSourceMap: false,
  css: {
    extract: false
  },
  chainWebpack: config => {
    // config.module
    //   .rule('js')
    //   .include
    //   .add('/packages')
    //   .end()
    //   .use('babel')
    //   .loader('babel-loader')
    //   .tap(options => {
    //     return options
    //   })
    config.module
      .rule('js').use('babel-loader')
    config.resolve.alias
      .set('vue-json-editors', resolve('./'))
  },
  configureWebpack: config => {
    config.entry.app = ["babel-polyfill", "./examples/main.js"];
  },
  devServer: {
    open: true,
  },
}
