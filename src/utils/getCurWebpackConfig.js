/**
 * 用于获取当前项目配置文件
 */
module.exports = (type, akfunConfig) => {
  let curConfig = {};
  if (type === 'dev') {
    curConfig = require('../webpack/webpack.dev.conf')(akfunConfig);
  } else if (type === 'lib') {
    curConfig = require('../webpack/webpack.library.conf')(akfunConfig);
  } else if (type === 'build') {
    curConfig = require('../webpack/webpack.prod.conf')(akfunConfig);
  } else if (type === 'base') {
    curConfig = require('../webpack/webpack.base.conf')(akfunConfig);
  }
  return curConfig;
};
