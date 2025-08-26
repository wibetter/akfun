const glob = require('glob');

const fileExists = function (fileDir) {
  let exists = false;
  const files = glob.sync(fileDir); // 同步读取本地文件
  if (files.length > 0) {
    exists = true;
  }
  return exists;
};

module.exports = function (currentConfigDir) {
  let currentConfig = {};
  if (fileExists(currentConfigDir)) {
    currentConfig = require(currentConfigDir);
  }
  return currentConfig;
};
