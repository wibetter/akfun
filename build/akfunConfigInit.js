const path = require('path');

const createFile = require('../src/utils/createFile.js'); // 创建配置文件

const createDefaultConfig = function() {
  createFile(path.resolve(__dirname, '../src/initData/template/akfun.config.js'),
    path.resolve(process.cwd(), './akfun.config.js'));
};

module.exports = createDefaultConfig;
