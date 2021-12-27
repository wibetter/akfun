'use strict';
// 统一路径解析：
const { resolve } = require('../utils/pathUtils');
const defaultAKFunConfig = require('./default.config');
const getConfigObj = require('../utils/getConfigObj');
const deepMergeConfig = require('../utils/deepMergeConfig');

/** akfun脚手架赋予当前项目的默认配置
 * 备注：项目根目录的akfun.config.js的配置内容优先级高于defultAKFunConfig
 */

// 从项目根目录获取当前项目的配置文件
const curProjectConfig = getConfigObj(resolve('akfun.config.js'));

// 备注：数组类型则直接覆盖
module.exports = deepMergeConfig(defaultAKFunConfig, curProjectConfig);
