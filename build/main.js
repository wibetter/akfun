// akfun 功能模块引用主入口
const path = require('path');
const buildAction = require('../src/build.js'); // 构建脚本：生产环境
const devAction = require('../src/dev-server.js'); // 构建脚本：开发环境
const getCurWebpackConfig = require('./getCurWebpackConfig.js'); // 用于获取当前webpack配置的方法
const curWebpackBaseConfPath = path.resolve(__dirname, '../src/webpack/webpack.base.conf.js');

module.exports = {
  dev: devAction,
  build: buildAction,
  getCurWebpackConfig,
  curWebpackBaseConfPath,
};
