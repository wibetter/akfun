// akfun 功能模块引用主入口
const buildAction = require('../src/build.js'); // 构建脚本：生产环境
const devAction = require('../src/dev-server.js'); // 构建脚本：开发环境
const build2esm = require('../src/build2esm.js'); // 构建esm输出模块
const build2node = require('../src/build2node.js'); // 构建esm输出模块
const inspect = require('./inspect.js');
const gitClone = require('../src/utils/gitClone.js');
const createFile = require('../src/utils/createFile');
const {resolve} = require('../src/utils/pathUtils');
const getConfigObj = require('../src/utils/getConfigObj');
const deepMergeConfig = require('../src/utils/deepMergeConfig');
const getCurWebpackConfig = require('../src/utils/getCurWebpackConfig.js'); // 用于获取当前webpack配置的方法
const aliBOS = require('../src/oss/aliBos.js');
const baiduBOS = require('../src/oss/baiduBos.js');

// 新增：配置管理和环境管理
const configManager = require('../src/manage/ConfigManager');
const { validateConfig } = require('../src/utils/configValidator');

module.exports = {
  // 核心功能
  dev: devAction,
  build: buildAction,
  build2esm,
  build2node,
  inspect,
  
  // 工具方法
  gitClone,
  createFile,
  resolve,
  getConfigObj,
  deepMergeConfig,
  getCurWebpackConfig,
  curWebpackBaseConfPath: getCurWebpackConfig('base'),
  
  // OSS 上传
  aliBOS,
  baiduBOS,
  
  // 新增：配置管理
  configManager,
  validateConfig
};
