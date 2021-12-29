// rollup.config.js
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // 支持node中的文件导入
const commonjs = require('@rollup/plugin-commonjs'); // 识别cmd模块
const vue = require('rollup-plugin-vue');
const json = require('@rollup/plugin-json'); // 识别json类型文件
const image = require('@rollup/plugin-image'); // 图片处理器
const { terser } = require('rollup-plugin-terser'); // 压缩
const alias = require('@rollup/plugin-alias'); // 简写配置
// css相关处理器
const postcss = require('rollup-plugin-postcss');
// 处理css定义的变量
const simplevars = require('postcss-simple-vars');
// 处理less嵌套样式写法
const nested = require('postcss-nested');
// 替代cssnext
const postcssPresetEnv = require('postcss-preset-env');
// css代码压缩
const cssnano = require('cssnano');
const { resolveToCurrentRoot, resolveToCurrentDist } = require('../utils/pathUtils'); // 统一路径解析
const babelConfig = require('./babel.config'); // Babel的配置文件
const curProjectConfig = require('./index'); // 引入当前项目配置文件
const {buildBanner} = require("../utils/akfunParams");

module.exports = function(fileName, akfunConfig) {
  const curConfig = akfunConfig || curProjectConfig;
  // 获取用户配置的构建入口文件
  let rollupInput = resolveToCurrentRoot('src/main.js');
  if (curConfig.build2esm && curConfig.build2esm.input) {
    rollupInput = curConfig.build2esm.input;
  }
  let curFileName = fileName || 'index'; // 默认以"index.esm.js"输出
  // 获取用户配置的构建输出文件名
  if (curConfig.build2esm && curConfig.build2esm.fileName) {
    curFileName = curConfig.build2esm.fileName;
  }
  // 增加babel配置
  babelConfig.babelHelpers = 'runtime';

  return {
    banner: buildBanner,
    input: rollupInput,
    // external：将模块视为外部模块，不会打包在库中（在akfun.config.js中配置）
    plugins: [
      alias({
        resolve: curConfig.webpack.resolve.extensions,
        extensions: curConfig.webpack.resolve.extensions,
        entries: curConfig.webpack.resolve.alias
      }),
      nodeResolve({
        extensions: curConfig.webpack.resolve.extensions
      }),
      babel(babelConfig), // 备注，需要先babel()再commjs()
      vue(),
      commonjs(),
      postcss({
        extensions: ['.css', '.scss', '.sass', '.styl', '.stylus', '.less'],
        // Or with custom file name, it will generate file relative to bundle.js in v3
        extract: resolveToCurrentDist(`${curFileName}.css`),
        plugins: [
          simplevars(),
          nested(),
          // cssnext({ warnForDuplicates: false, }),
          postcssPresetEnv(),
          cssnano()
        ]
      }),
      image(),
      json()
    ],
    output: [
      {
        file: resolveToCurrentDist(`${curFileName}.esm.js`),
        format: 'esm'
      },
      {
        file: resolveToCurrentDist(`${curFileName}.esm.min.js`),
        format: 'esm',
        plugins: [terser()]
      }
    ]
  };
};
