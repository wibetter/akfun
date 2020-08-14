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

const devClientPath = path.resolve(__dirname, '../dev-client'); // 从akfun中获取

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach((name) => {
  baseWebpackConfig.entry[name] = [devClientPath].concat(
    baseWebpackConfig.entry[name],
  );
});

module.exports = merge(baseWebpackConfig, {
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
      template: config.webpack.template,
      inject: true,
      minify: false,
    }),
    new FriendlyErrorsPlugin(),
    new ProgressBarPlugin(),
  ],
});
