const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const utils = require('./loaderUtils');
// 引入当前项目配置文件
const projectConfig = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');
const entrys2htmlWebpackPlugin = require('../utils/entrys2htmlWebpackPlugin');

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
        environment: 'dev'
      })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: '#source-map', // '#cheap-module-eval-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(curEnvConfig.NODE_ENV) // vue-router中根据此变量判断执行环境
      }),
      // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new FriendlyErrorsPlugin(),
      new ProgressBarPlugin()
    ]
  });

  // 使用用户自定义的多入口配置，生产对应的多页面多模板（优先使用用户的自定义页面模板）
  const htmlWebpackPluginList = entrys2htmlWebpackPlugin(webpackDevConfig.entry, curHtmlTemplate);
  htmlWebpackPluginList.forEach((htmlWebpackPlugin) => {
    webpackDevConfig.plugins.push(htmlWebpackPlugin);
  });

  // 开启热更新能力
  const devClientPath = path.resolve(__dirname, '../dev-client'); // 从akfun中获取
  // add hot-reload related code to entry chunks
  if (webpackDevConfig.entry) {
    Object.keys(webpackDevConfig.entry).forEach((name) => {
      webpackDevConfig.entry[name] = [devClientPath].concat(webpackDevConfig.entry[name]);
    });
  }

  return webpackDevConfig;
};
