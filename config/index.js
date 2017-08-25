// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8080,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      //地图详细数据
      '/api/getMapDetails/*': {
        target: 'http://localhost:8000',
        secure: false
      },
      //地图
      '/api/getMap/*': {
        target: 'http://localhost:8000',
        secure: false
      },
      //折线图
      '/api/getAmountByDate/*': {
        target: 'http://localhost:8000',
        secure: false
      },
      '/api/v1/*': {
        target: 'http://testbk.wezebra.com',
        // target: 'http://192.168.0.128:8080',
        secure: false
      },
      // 'http://localhost:': {
      //   target: 'http://testbk.wezebra.com',
      //   // target: 'http://192.168.0.128:8080',
      //   secure: false
      // },
      '/riskcontrol/*': {
        target: 'http://testbk.wezebra.com',
        // target: 'http://192.168.0.128:8080',
        secure: false
      },
      '/postlending/*': {
        target: 'http://testbk.wezebra.com',
        // target: 'http://192.168.0.128:8080',
        secure: false
      },
      '/counter/*': {
        target: 'http://testbk.wezebra.com',
        // target: 'http://192.168.0.128:8080',
        secure: false
      },
      '/anon': {
        target: 'http://testbk.wezebra.com',
        // target: 'http://192.168.0.128:8080',
        secure: false,
        pathRewrite: {
          '^/anon': '/anon'
        }
      },
      '/admin/api/branch/*': {
        target: 'http://192.168.0.107:8001',
        secure: false
      },
      '/api/upload/*': {
        target: 'http://192.168.0.107:8001',
        secure: false
      }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
