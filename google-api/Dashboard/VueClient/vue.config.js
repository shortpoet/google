// const fs = require('fs')
// const path = require('path')

module.exports = {
  css: {
    // fixed css loader issue for npm from bash 
    extract: false,
    // loaderOptions: {
    //   scss: {
    //     prependData: `@import "~@/assets/scss/_variables.scss";`
    //   }
    // }
  },
  configureWebpack: {
    // devtool: 'source-map',
    // plugins: [
    //   new GoogleFontsPlugin('./src/assets/fonts.json')
    // ],  
    },
    // baseUrl: process.env.NODE_ENV === 'production' ? '/subpath/' : '/',
    // publicPath: process.env.NODE_ENV === 'production'
    //   ? '/production-sub-path/'
    //   : '/',
  devServer: {
    // proxy: 'https://localhost:8080',
    // adding public seemed to do the same as
    // adding the below cmd to package.json
    // "servelocal": "vue-cli-service serve --host localhost",
    // public: 'https://localhost:8080/',
    // port: 8080, // CHANGE YOUR PORT HERE!
    https: false,
    // hotOnly: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
    // http://vuejs-templates.github.io/webpack/static.html
    // https://stackoverflow.com/questions/43879418/deploy-vuejs-app-in-a-subdirectory/43880261#43880261
    // https://cli.vuejs.org/guide/html-and-static-assets.html
    // Other options include:
    // outputDir: undefined,
    // assetsDir: undefined,
    // runtimeCompiler: undefined,
    // productionSourceMap: undefined,
    // parallel: undefined,
    // css: undefined
  }
}
  