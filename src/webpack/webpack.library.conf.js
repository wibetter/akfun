const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const utils = require('./loaderUtils');
// 引入当前项目配置文件
const projectConfig = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');

module.exports = (akfunConfig) => {
  let config = akfunConfig || projectConfig; // 默认使用执行命令目录下的配置数据
  const curEnvConfig = config.build2lib || {}; // 当前执行环境配置
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig(curEnvConfig, config);

  let curTarget = ['web', 'es5'];
  if (config.webpack.target) {
    curTarget = config.webpack.target; // akfun.config.js中的webpack配置
  }

  const webpackLibConfig = merge(baseWebpackConfig, {
    target: curTarget,
    mode: curEnvConfig.NODE_ENV, // production 模式，会启动UglifyJsPlugin服务
    output: {
      path: curEnvConfig.assetsRoot, // 输出文件的存放在本地的目录
      filename: '[name].umd.js',
      publicPath: '',
      library: {
        type: 'umd', // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
        name: curEnvConfig.libraryName || '[name]'
      },
      // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
      globalObject: 'this' // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: curEnvConfig.productionSourceMap,
        environment: 'prod',
        cssLoaderUrl: config.webpack.cssLoaderUrl,
        cssLoaderUrlDir: config.webpack.cssLoaderUrlDir
      })
    },
    devtool: curEnvConfig.productionSourceMap ? curEnvConfig.devtool || 'source-map' : false, // 线上生成环境
    optimization: {
      /**
       *  named 对调试更友好的可读的 id。
       *  deterministic 在不同的编译中不变的短数字 id。有益于长期缓存。在生产模式中会默认开启。
       */
      chunkIds: 'named',
      emitOnErrors: true,
      minimize: true,
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new CssMinimizerPlugin()
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        // filename: utils.assetsPath('index.css'),
        filename: '[name].css',
        chunkFilename: '[name].css',
        ignoreOrder: false
      })
    ]
  });

  // 是否开启Gzip
  if (curEnvConfig.productionGzip) {
    webpackLibConfig.plugins.push(
      new CompressionWebpackPlugin({
        test: new RegExp(`\\.(${curEnvConfig.productionGzipExtensions.join('|')})$`),
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        threshold: 240,
        minRatio: 0.8
      })
    );
  }

  // 判断当前环境是否有自定义plugins
  if (curEnvConfig.plugins && Array.isArray(curEnvConfig.plugins)) {
    // 添加自定义webpack插件
    webpackLibConfig.plugins.push(...curEnvConfig.plugins);
  }

  if (curEnvConfig.bundleAnalyzerReport) {
    webpackLibConfig.plugins.push(new BundleAnalyzerPlugin());
  }

  return webpackLibConfig;
};
