const path = require('path');

const createFile = require('../src/utils/createFile.js'); // 创建配置文件

const createDefaultConfig = function(configFileName) {
  createFile(path.resolve(__dirname, `../src/initData/config/${configFileName}`),
    path.resolve(process.cwd(), `./${configFileName}`));
};

createDefaultConfig('.babelrc')
