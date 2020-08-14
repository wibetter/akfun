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
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: curHtmlTemplate,
      inject: true,
      minify: false,  // mode: 'production'模式下会自定压缩html代码，优先级比minify高
    }),
    new FriendlyErrorsPlugin(),
    new ProgressBarPlugin(),
  ],
};

// 集成构建入口相关的配置
if (config.dev.entry) {
  webpackDevConfig.entry = config.dev.entry; // 会覆盖config.webpack.entry的配置
}

module.exports =  merge(baseWebpackConfig, webpackDevConfig);

