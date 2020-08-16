const path = require('path');

const createFile = require('./createFile.js'); // 创建配置文件

const createDefaultConfig = function (configFileName) {
  createFile(
    path.resolve(__dirname, `../initData/config/${configFileName}`),
    path.resolve(process.cwd(), `./${configFileName}`)
  );
};

module.exports = createDefaultConfig;
