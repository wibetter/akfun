// rollup.config.js
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // 支持node中的文件导入
const typescript = require('@rollup/plugin-typescript'); // 支持ts
const commonjs = require('@rollup/plugin-commonjs'); // 识别cmd模块
const json = require('@rollup/plugin-json'); // 识别json类型文件
const alias = require('@rollup/plugin-alias'); // 简写配置
const { nodeExternals } = require('rollup-plugin-node-externals');
const { resolveToCurrentRoot, resolveToCurrentDist } = require('../utils/pathUtils'); // 统一路径解析
const { buildBanner } = require('../utils/akfunParams');
const { resolve } = require('../utils/pathUtils'); // 统一路径解析

/**
 * 用于生成构建 node 模块的 rollup 配置
 * 备注：node 模块构建不需要使用 babel，也不需要处理css、图片、svg 等文件。
 * @param {*} curConfig 当前项目配置
 * @param {*} curEnvConfig 当前环境配置
 *
 * 支持的配置项目（curEnvConfig）
 * - type: 项目构建类型（ts、js）
 * - format: 构建格式（esm、cjs）
 * - input: 构建入口文件
 * - fileName: 构建输出文件名
 * - outDir: 构建输出目录
 * - excludeList: 构建排除列表
 * - declaration: 是否生成声明文件
 * - declarationDir: 声明文件输出目录
 */
module.exports = function (curConfig, curEnvConfig) {
  const buildFormat = curEnvConfig.format || 'cjs';
  const buildType = curEnvConfig.type || 'ts';
  const curWebpackConfig = curConfig.webpack || {};

  let rollupInput = resolveToCurrentRoot('src/main.js'); // 默认入口文件为 src/main.js
  if (curEnvConfig.input) {
    rollupInput = curEnvConfig.input;
  }

  let curFileName = 'index'; // 默认以"index.esm.js"输出
  // 获取用户配置的构建输出文件名
  if (curEnvConfig.fileName) {
    curFileName = curEnvConfig.fileName;
  }

  return {
    banner: buildBanner,
    input: rollupInput,
    plugins: [
      alias({
        entries: Object.entries(curWebpackConfig.resolve.alias || {}).map(
          ([find, replacement]) => ({
            find,
            replacement
          })
        )
      }),
      nodeExternals({
        include: curEnvConfig.excludeList || []
      }),
      nodeResolve({
        extensions: curWebpackConfig.resolve.extensions
      }),
      buildType === 'ts'
        ? typescript({
            // 是否生成声明文件（默认 false）
            declaration: curEnvConfig.declaration !== undefined ? curEnvConfig.declaration : false,
            declarationDir: curEnvConfig.declarationDir || './dist/types'
          })
        : undefined,
      commonjs({
        transformMixedEsModules: true, // 转换混合的 ES 模块和 CommonJS 模块
        strictRequires: true, // 严格模式处理 require，确保所有 require 都被正确处理
        ignoreDynamicRequires: true // 忽略动态 require
      }),
      json()
    ],
    output: {
      dir: curEnvConfig.outDir || resolve('dist'),
      format: buildFormat, // which can be one of "amd", "cjs", "system", "es", "iife" or "umd".
      preserveModules:
        curEnvConfig.preserveModules !== undefined ? curEnvConfig.preserveModules : true, // 关键：保留原始模块结构，不合并文件
      preserveModulesRoot: 'src', // 指定模块根目录
      exports: 'auto', // 自动处理导出（适配 ES 模块的默认导出/命名导出）
      generatedCode: 'es2015', // 使用现代 JavaScript 语法生成代码
      entryFileNames: '[name].js'
      // interop: 'auto' // 自动处理 CJS/ES 模块互操作（如 __esModule 标记）
    }
  };
};
