'use strict';
// 统一路径解析：
const { resolve } = require('../utils/pathUtils');
const getConfigObj = require('../utils/getConfigObj');

/** akfun脚手架赋予当前项目的默认配置
 * 备注：项目根目录的akfun.config.js的配置内容优先级高于defultAKFunConfig
 */
const defultAKFunConfig = {
  settings: {
    enableEslint: true, // 调试模式是否开启ESLint，默认开启ESLint检测代码格式
  },
  webpack: {
    entry: {
      // webpack构建入口（优先级低于于dev、build和build2lib中的entry配置）
      index: './src/index.js',
    },
    resolve: {
      // webpack的resolve配置
      extensions: ['.js', '.jsx', '.vue', 'json'], // 用于配置webpack在尝试过程中用到的后缀列表
      alias: {
        '@': resolve('src'),
        $components: resolve('src/components'),
        $pages: resolve('src/pages'),
        $plugins: resolve('src/plugins'),
        $utils: resolve('src/utils'),
      },
    },
    externals: [], // 从输出的 bundle 中排除依赖
    template: resolve('src/index.html'), // 默认使用的页面模板
    sassResources: [],
  },
  envParams: {
    // 项目系统环境变量
    common: {
      // 通用参数
      '#version#': '20200810.1',
    },
    local: {
      // 本地开发环境
      '#dataApiBase#': 'http://localhost:1024', // 数据接口根地址
      '#assetsPublicPath#': 'http://localhost:1024', // 静态资源根地址
      '#routeBasePath#': '/', // 路由根地址
    },
    online: {
      // 线上正式环境配置参数
      '#dataApiBase#': '/', // 数据接口根地址 "//xxx.cn/"格式
      '#assetsPublicPath#': '', // 静态资源根地址 "//xxx.cn/_spa/projectName"格式
      '#routeBasePath#': '/', // 路由根地址 "/_spa/projectName/"格式
    },
  },
  dev: {
    // 用于开启本地调试模式的相关配置信息
    NODE_ENV: 'development',
    port: 80,
    autoOpenBrowser: true,
    assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '',
    hostname: 'localhost',
    proxyTable: {
      '/apiTest': {
        target: 'http://api-test.com.cn', // 不支持跨域的接口根地址
        ws: true,
        changeOrigin: true,
      },
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,
  },
  build: {
    // 用于构建生产环境代码的相关配置信息
    NODE_ENV: 'production', // production 模式，会启动UglifyJsPlugin服务
    assetsRoot: resolve('dist'), // 编译完成的文件存放路径
    assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '', // 资源引用二级路径
    productionSourceMap: false,
    // Gzip off by default as many popular public hosts such as
    // Surge or Netlify already gzip all public assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css', 'json'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: false,
  },
  build2lib: {
    // 用于构建第三方功能包的配置文件
    NODE_ENV: 'production',
    libraryName: '', // 构建第三方功能包时最后导出的引用变量名
    assetsRoot: resolve('dist'), // 编译完成的文件存放路径
    assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '', // 资源引用二级路径
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css', 'json'],
    bundleAnalyzerReport: false,
  },
};

// 从项目根目录获取当前项目的配置文件
const curProjectConfg = getConfigObj(resolve('akfun.config.js'));

module.exports = Object.assign(defultAKFunConfig, curProjectConfg);
