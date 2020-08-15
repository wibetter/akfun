const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const utils = require('./loaderUtils');
// 引入当前项目配置文件
const config = require('../config/index');
const baseWebpackConfig = require('./webpack.base.conf');
const { resolve } = require('../utils/pathUtils'); // 统一路径解析
const getJsEntries = require('../utils/jsEntries');
const entrys2htmlWebpackPlugin = require('../utils/entrys2htmlWebpackPlugin');

const devClientPath = path.resolve(__dirname, '../dev-client'); // 从akfun中获取

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach((name) => {
  baseWebpackConfig.entry[name] = [devClientPath].concat(
    baseWebpackConfig.entry[name],
  );
});

// 获取页面模板地址
let curHtmlTemplate = resolve('../initData/template/index.html');
if (config.webpack.template) {
  curHtmlTemplate = config.webpack.template; // akfun.config.js中的webpack配置
}

const webpackDevConfig = {
  mode: config.dev.NODE_ENV, // development模式，会启动NamedChunksPlugin、NamedModulesPlugin服务
  output: {
    globalObject: "window",
    publicPath: config.dev.assetsPublicPath, // 引用地址：配置发布到线上资源的URL前缀
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      environment: 'dev',
    }),
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(config.dev.NODE_ENV), // vue-router中根据此变量判断执行环境
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // stylelint插件@用于验证scss文件里面的style规范
    new StyleLintPlugin({
      syntax: 'scss',
      files: ['src/**/*.vue', 'src/**/*.scss', 'src/**/*.css'],
    }),
    new FriendlyErrorsPlugin(),
    new ProgressBarPlugin(),
  ],
};

// 集成dev配置中的构建入口
if (config.dev.entry) {
  webpackDevConfig.entry = config.dev.entry; // 会覆盖config.webpack.entry的配置
}

// 多页面支持能力
if (webpackDevConfig.entry) {

  let entryConfig = webpackDevConfig.entry || {};
  const entryFiles = Object.keys(entryConfig);

  if (!webpackDevConfig.entry) {
    // 自动从'./src/pages/'中获取入口文件
    webpackDevConfig.entry = getJsEntries();
  } else if (entryFiles.length === 1) {
    // webpackDevConfig.entryAKFun提供的默认入口文件不存在
    const filename = entryFiles[0];
    const entryFilePath = entryConfig[filename];
    fs.exists(entryFilePath, function (exist) {
      if (!exist) {
        // 自动从'./src/pages/'中获取入口文件
        webpackDevConfig.entry = getJsEntries();
        // 重新获取webpackDevConfig.entry
        entryConfig = webpackDevConfig.entry || {};
        const htmlWebpackPluginList = entrys2htmlWebpackPlugin(entryConfig, curHtmlTemplate);
        htmlWebpackPluginList.forEach(htmlWebpackPlugin => {
          webpackDevConfig.plugins.push(htmlWebpackPlugin);
        });
      }
    });
  } else {
    const htmlWebpackPluginList = entrys2htmlWebpackPlugin(entryConfig, curHtmlTemplate);
    htmlWebpackPluginList.forEach(htmlWebpackPlugin => {
      webpackDevConfig.plugins.push(htmlWebpackPlugin);
    });
  }
}

module.exports =  merge(baseWebpackConfig, webpackDevConfig);

