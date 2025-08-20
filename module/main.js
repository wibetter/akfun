// akfun 功能模块引用主入口
const buildAction = require('../src/build.js'); // 构建脚本：生产环境
const devAction = require('../src/dev-server.js'); // 构建脚本：开发环境
const build2esm = require('../src/build2esm.js'); // 构建esm输出模块
const inspect = require('./inspect.js');
const gitClone = require('../src/utils/gitClone.js');
const createFile = require('../src/utils/createFile');
const {resolve} = require('../src/utils/pathUtils');
const getConfigObj = require('../src/utils/getConfigObj');
const deepMergeConfig = require('../src/utils/deepMergeConfig');
const getCurWebpackConfig = require('../src/utils/getCurWebpackConfig.js'); // 用于获取当前webpack配置的方法
const aliBOS = require('../src/oss/aliBos.js');
const baiduBOS = require('../src/oss/baiduBos.js');

module.exports = {
  dev: devAction,
  build: buildAction,
  build2esm,
  inspect,
  gitClone,
  createFile,
  resolve,
  getConfigObj,
  deepMergeConfig,
  getCurWebpackConfig,
  curWebpackBaseConfPath: getCurWebpackConfig('base'),
  aliBOS,
  baiduBOS
};
