const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const utils = require('./loaderUtils');
// 引入当前项目配置文件
const projectConfig = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');
const entrys2htmlWebpackPlugin = require('../utils/entrys2htmlWebpackPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('../config');
// const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (akfunConfig) => {
  let config = akfunConfig || projectConfig; // 默认使用执行命令目录下的配置数据
  const curEnvConfig = config.dev || {}; // 当前执行环境配置
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig(curEnvConfig, config);

  // 获取页面模板地址
  let curHtmlTemplate = path.resolve(__dirname, '../initData/template/index.html');
  if (config.webpack.template) {
    curHtmlTemplate = config.webpack.template; // akfun.config.js中的webpack配置
  }

  const webpackDevConfig = merge(baseWebpackConfig, {
    mode: curEnvConfig.NODE_ENV, // development模式，会启动NamedChunksPlugin、NamedModulesPlugin服务
    output: {
      publicPath: curEnvConfig.assetsPublicPath // 引用地址：配置发布到线上资源的URL前缀
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: curEnvConfig.cssSourceMap,
        environment: 'prod', // 'dev': 不会将css单独提取出来
        cssLoaderUrl: config.webpack.cssLoaderUrl,
        cssLoaderUrlDir: config.webpack.cssLoaderUrlDir
      })
    },
    // devtool: '#cheap-module-eval-source-map', // 本地开发环境中的取值
    devtool: curEnvConfig.productionSourceMap ? curEnvConfig.devtool || 'eval-source-map' : 'eval', // 开发环境
    optimization: {
      chunkIds: 'named', // named 对调试更友好的可读的 id。
      emitOnErrors: true,
      minimize: false
    },
    plugins: [
      // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
      new webpack.HotModuleReplacementPlugin(),
      new MiniCssExtractPlugin({
        // filename: utils.assetsPath('index.css'),
        filename: '[name].css',
        chunkFilename: '[name].css',
        ignoreOrder: false
      })
    ]
  });

  if (!webpackDevConfig.closeHtmlWebpackPlugin) {
    // 使用用户自定义的多入口配置，生产对应的多页面多模板（优先使用用户的自定义页面模板）
    const htmlWebpackPluginList = entrys2htmlWebpackPlugin(webpackDevConfig.entry, curHtmlTemplate);
    htmlWebpackPluginList.forEach((htmlWebpackPlugin) => {
      webpackDevConfig.plugins.push(htmlWebpackPlugin);
    });
  }

  // 开启热更新能力
  const devClientPath = path.resolve(__dirname, '../dev-client'); // 从akfun中获取
  // add hot-reload related code to entry chunks
  if (!curEnvConfig.closeHotReload && webpackDevConfig.entry) {
    Object.keys(webpackDevConfig.entry).forEach((name) => {
      webpackDevConfig.entry[name] = [devClientPath].concat(webpackDevConfig.entry[name]);
    });
  }

  return webpackDevConfig;
};
