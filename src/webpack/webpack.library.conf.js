const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const deepMergeConfig = require('../utils/deepMergeConfig');

const utils = require('./loaderUtils');
const getProjectConfig = require('../config/index'); // 用于获取当前项目配置文件
const getBaseWebpackConfig = require('./webpack.base.conf');

/**
 * 第三方库 webpack 配置，用于构建第三方库（仅构建可用的 umd 模块，其构建产物不会注入到 html 中）
 * @param {*} akfunConfig 当前项目配置
 * @returns
 */
module.exports = (akfunConfig) => {
  let config = akfunConfig || getProjectConfig(); // 优先使用外部传进来的项目配置
  const curEnvConfig = config.build2lib || {}; // 当前执行环境配置
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig(curEnvConfig, config, 'build2lib');
  const curWebpackConfig = config.webpack || {};

  let curTarget = ['web', 'es5'];
  if (curWebpackConfig.target) {
    curTarget = curWebpackConfig.target; // akfun.config.js中的webpack配置
  }

  const webpackLibConfig = merge(baseWebpackConfig, {
    target: curTarget,
    mode: curEnvConfig.NODE_ENV, // production 模式，会启动UglifyJsPlugin服务
    output: {
      path: curEnvConfig.assetsRoot, // 输出文件的存放在本地的目录
      filename: '[name].umd.js',
      publicPath: '',
      library: {
        type: 'umd', // 定义打包方式Universal Module Definition，同时支持在CommonJS、AMD和全局变量使用
        name: curEnvConfig.libraryName || '[name]'
      },
      // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
      globalObject: 'this' // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
    },
    module: {
      rules: utils.styleLoaders({
        envConfig: curEnvConfig, // 当前环境变量
        webpackConfig: curWebpackConfig // 当前webpack配置
      })
    },
    devtool: curEnvConfig.productionSourceMap ? curEnvConfig.devtool || 'source-map' : false, // 线上生成环境
    optimization: {
      /**
       *  named 对调试更友好的可读的 id。
       *  deterministic 在不同的编译中不变的短数字 id。有益于长期缓存。在生产模式中会默认开启。
       */
      chunkIds: 'named',
      /**
       * 当 optimization.splitChunks 未配置或设置为 false 时，
       * webpack 会将所有模块打包到一个 JS 文件中（除了异步加载的模块）。
       */
      emitOnErrors: true,
      // minimize: true,
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new CssMinimizerPlugin()
      ]
    },
    plugins: []
  });

  // 优先使用当前环境配置中的output
  if (curEnvConfig.output) {
    webpackLibConfig.output = deepMergeConfig(webpackLibConfig.output, curEnvConfig.output);
  }

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

  // 支持 cssExtract 配置
  if (curEnvConfig.cssExtract || curEnvConfig.cssExtract === undefined) {
    webpackLibConfig.plugins.push(
      new MiniCssExtractPlugin({
        // filename: utils.assetsPath('index.css'),
        filename: '[name].css',
        chunkFilename: '[name].css',
        ignoreOrder: false
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
