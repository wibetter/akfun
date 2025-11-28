const getProjectConfig = require('./config/index'); // 用于获取当前项目配置文件
const { curConsoleTag } = require('./utils/akfunParams');
const rollupBuild = require('./rollup/build');
const rollupConfig = require('./rollup/rollup.node.config'); // rollup的配置文件
/**
 * 用于构建 esm 模块
 * @param {*} akfunConfig akfun 配置文件
 * @param {*} _consoleTag 控制台输出标签
 *
 * 支持的配置项目（akfunConfig.build2node）
 * - type: 项目构建类型（ts、js）
 * - input: 构建入口文件
 * - fileName: 构建输出文件名
 * - outDir: 构建输出目录
 * - preserveModules: 是否保留原始模块结构，不合并文件
 * - excludeList: 构建排除列表
 * - declaration: 是否生成声明文件
 * - declarationDir: 声明文件输出目录
 */

// 构建脚本：一般用于构建生产环境的代码
module.exports = function (akfunConfig, _consoleTag) {
  const consoleTag = _consoleTag || curConsoleTag;
  // 获取项目配置文件
  let config = getProjectConfig(akfunConfig);
  const build2node = config.build2node; // 用户的项目配置

  const curRollupConfig = rollupConfig(config, build2node); // 默认配置

  build2node.format = 'cjs'; // 构建格式固定为 cjs，无需用户配置

  rollupBuild(config, build2node, curRollupConfig, consoleTag);
};
