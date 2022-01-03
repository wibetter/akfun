const webpack = require('webpack');
const merge = require('webpack-merge');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const utils = require('./loaderUtils');
// 引入当前项目配置文件
const projectConfig = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');

module.exports = (akfunConfig) => {
  let config = akfunConfig || projectConfig; // 默认使用执行命令目录下的配置数据
  const curEnvConfig = config.build2lib || {}; // 当前执行环境配置
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig(curEnvConfig, config.webpack);

  const webpackLibConfig = merge(baseWebpackConfig, {
    mode: curEnvConfig.NODE_ENV, // production 模式，会启动UglifyJsPlugin服务
    output: {
      path: curEnvConfig.assetsRoot, // 输出文件的存放在本地的目录
      filename: '[name].umd.js',
      publicPath: '',
      library: curEnvConfig.libraryName, // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
      globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
      libraryTarget: 'umd' // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: curEnvConfig.productionSourceMap,
        environment: 'prod'
      })
    },
    devtool: curEnvConfig.productionSourceMap ? '#source-map' : false, // '#source-map': 源码，false：压缩代码
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(curEnvConfig.NODE_ENV)
      }),
      new MiniCssExtractPlugin({
        // filename: utils.assetsPath('index.css'),
        filename: "[name].css",
        chunkFilename: "[name].css",
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

  if (curEnvConfig.bundleAnalyzerReport) {
    webpackLibConfig.plugins.push(new BundleAnalyzerPlugin());
  }

  return webpackLibConfig;
};
