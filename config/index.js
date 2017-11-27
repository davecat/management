// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
// var proxyPath = 'http://testbk.wezebra.com';
var proxyPath = 'http://localhost:8085';
var versiony = require('versiony');

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/'+versiony.from('package.json').get()+'/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist/'+versiony.from('package.json').get()),
    assetsSubDirectory: 'static',
    assetsPublicPath: 'https://libfile1.wezebra.com/'+versiony.from('package.json').get(),
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
      //中介报表
      '/api/agency': {
        target: 'http://0.0.0.0:8888',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api/agency': '/api/agency'
        }
      },
      //地图
      '/api/getMap': {
        target: 'http://0.0.0.0:8888',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api/getMap': '/api/getMap'
        }
      },
      //折线图
      '/api/getAmountByDate': {
        target: 'http://0.0.0.0:8888',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api/getAmountByDate': '/api/getAmountByDate'
        }
      },
      //中介接口
      '/api/v2': {
        // target: '192.168.0.120:8085',
        target: proxyPath,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api/v2': '/api/v2'
        }
      },
      // 中退、撤回
      '/counter': {
        target: proxyPath,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/counter': '/counter'
        }
      },
      //获取门店二维码
      '/admin/api/branch': {
        target: proxyPath,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/admin/api/branch': '/admin/api/branch'
        }
      }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
};
