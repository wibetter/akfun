const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const utils = require('./loaderUtils');
// 引入当前项目配置文件
const config = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');
const { resolve } = require('../utils/pathUtils'); // 统一路径解析
const getJsEntries = require('../utils/jsEntries');
const entrys2htmlWebpackPlugin = require('../utils/entrys2htmlWebpackPlugin');
const { isArray } = require('../utils/typeof');

module.exports = () => {
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig();

  const devClientPath = path.resolve(__dirname, '../dev-client'); // 从akfun中获取
  // add hot-reload related code to entry chunks
  Object.keys(baseWebpackConfig.entry).forEach((name) => {
    baseWebpackConfig.entry[name] = [devClientPath].concat(baseWebpackConfig.entry[name]);
  });

  // 获取页面模板地址
  let curHtmlTemplate = path.resolve(__dirname, '../initData/template/index.html');
  if (config.webpack.template) {
    curHtmlTemplate = config.webpack.template; // akfun.config.js中的webpack配置
  }

  const webpackDevConfig = merge(baseWebpackConfig, {
    mode: config.dev.NODE_ENV, // development模式，会启动NamedChunksPlugin、NamedModulesPlugin服务
    output: {
      publicPath: config.dev.assetsPublicPath // 引用地址：配置发布到线上资源的URL前缀
    },
    module: {
      rules: utils.styleLoaders({
        sourceMap: config.dev.cssSourceMap,
        environment: 'dev'
      })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: '#cheap-module-eval-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(config.dev.NODE_ENV) // vue-router中根据此变量判断执行环境
      }),
      // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      // stylelint插件@用于验证scss文件里面的style规范
      new StyleLintPlugin({
        syntax: 'scss',
        files: ['src/**/*.vue', 'src/**/*.scss', 'src/**/*.css']
      }),
      new FriendlyErrorsPlugin(),
      new ProgressBarPlugin()
    ]
  });

  // 集成dev配置中的构建入口
  if (config.dev.entry) {
    webpackDevConfig.entry = config.dev.entry; // 会覆盖config.webpack.entry的配置
  }

  // 多页面多模板支持能力
  let entryConfig = webpackDevConfig.entry || {}; // 获取构建入口配置
  const entryFiles = (entryConfig && Object.keys(entryConfig)) || [];

  if (
    !webpackDevConfig.entry ||
    JSON.stringify(webpackDevConfig.entry) === '{}' ||
    entryFiles.length === 0
  ) {
    // 自动从'./src/pages/'中获取入口文件
    webpackDevConfig.entry = getJsEntries();
  } else if (webpackDevConfig.entry && entryFiles.length === 1) {
    /**
     * 备注：开发调试模式中，每个构建入口会自动注入热更新相关的代码
     */
    // 只有一个构建入口文件，且项目中不存在此文件
    const filename = entryFiles[0];
    let entryFilePath = entryConfig[filename];
    // 当前entryFilePath可能是一个地址字符串，也可能是一个存储多个文件地址的数组
    if (isArray(entryFilePath)) {
      // 如果是数组则自动获取最后一个文件地址
      entryFilePath = entryFilePath[entryFilePath.length - 1];
    }
    if (!fs.existsSync(entryFilePath)) {
      // 如果仅有的构建入口文件不存在，则自动从'./src/pages/'中获取入口文件
      const curJsEntries = getJsEntries();
      webpackDevConfig.entry = curJsEntries ? curJsEntries : webpackDevConfig.entry;
    }
    // 重新获取webpackDevConfig.entry
    entryConfig = webpackDevConfig.entry || {};
    const htmlWebpackPluginList = entrys2htmlWebpackPlugin(entryConfig, curHtmlTemplate);
    htmlWebpackPluginList.forEach((htmlWebpackPlugin) => {
      webpackDevConfig.plugins.push(htmlWebpackPlugin);
    });
  } else {
    // 使用用户自定义的多入口配置，生产对应的多页面多模板
    const htmlWebpackPluginList = entrys2htmlWebpackPlugin(entryConfig, curHtmlTemplate);
    htmlWebpackPluginList.forEach((htmlWebpackPlugin) => {
      webpackDevConfig.plugins.push(htmlWebpackPlugin);
    });
  }

  return webpackDevConfig;
};
