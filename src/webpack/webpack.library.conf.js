const webpack = require('webpack');
const merge = require('webpack-merge');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const utils = require('./loaderUtils');
// 引入当前项目配置文件
const config = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');

module.exports = () => {
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig();

  const webpackLibConfig = merge(baseWebpackConfig, {
    mode: config.build2lib.NODE_ENV, // production 模式，会启动UglifyJsPlugin服务
    output: {
      path: config.build2lib.assetsRoot, // 输出文件的存放在本地的目录
      filename: '[name].umd.js',
      publicPath: '',
      library: config.build2lib.libraryName, // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
      globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
      libraryTarget: 'umd' // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: config.build2lib.productionSourceMap,
        environment: 'prod'
      })
    },
    devtool: config.build2lib.productionSourceMap ? '#source-map' : false, // '#source-map': 源码，false：压缩代码
    externals: config.webpack.externals,
    plugins: [
      require('autoprefixer'),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(config.build2lib.NODE_ENV)
      }),
      new MiniCssExtractPlugin({
        filename: utils.assetsPath('index.css'),
        ignoreOrder: false
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      }),
      new FriendlyErrorsPlugin(),
      new ProgressBarPlugin()
    ]
  });

  // 是否开启Gzip
  if (config.build2lib.productionGzip) {
    webpackLibConfig.plugins.push(
      new CompressionWebpackPlugin({
        test: new RegExp(`\\.(${config.build2lib.productionGzipExtensions.join('|')})$`),
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        threshold: 240,
        minRatio: 0.8
      })
    );
  }

  if (config.build2lib.bundleAnalyzerReport) {
    webpackLibConfig.plugins.push(new BundleAnalyzerPlugin());
  }

  // 集成构建入口相关的配置
  if (config.build2lib.entry) {
    webpackLibConfig.entry = config.build2lib.entry; // 会覆盖config.webpack.entry的配置
  }

  return webpackLibConfig;
};
