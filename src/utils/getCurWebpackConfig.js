/**
 * 用于获取当前项目配置文件
 */
module.exports = (type) => {
  let curConfig = {};
  if (type === 'dev') {
    curConfig = require('../webpack/webpack.dev.conf')();
  } else if (type === 'lib') {
    curConfig = require('../webpack/webpack.library.conf')();
  } else if (type === 'build') {
    curConfig = require('../webpack/webpack.prod.conf')();
  } else if (type === 'base') {
    curConfig = require('../webpack/webpack.base.conf')();
  }
  return curConfig;
};
