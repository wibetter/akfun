/**
 * 用于获取当前项目配置文件
 */
module.exports = (type) => {
  let curConfig = {};
  if (type === 'dev') {
    curConfig = require('../src/webpack/webpack.dev.conf');
  } else if (type === 'lib') {
    curConfig = require('../src/webpack/webpack.library.conf');
  } else if (type === 'build') {
    curConfig = require('../src/webpack/webpack.build.conf');
  } else if (type === 'base') {
    curConfig = require('../src/webpack/webpack.base.conf');
  }
  return curConfig;
};
