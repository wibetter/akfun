// rollup.config.js
const { babel } = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve'); // 支持node中的文件导入
const commonjs = require('@rollup/plugin-commonjs'); // 识别cmd模块
const json = require('@rollup/plugin-json'); // 识别json类型文件
const { terser } = require('rollup-plugin-terser'); // 压缩
const alias = require('@rollup/plugin-alias'); // 简写配置
const { resolveToCurrentRoot } = require('../utils/pathUtils'); // 统一路径解析
const babelConfig = require('./babel.config'); // Babel的配置文件
const config = require('./index'); // 引入当前项目配置文件

module.exports = {
  input: resolveToCurrentRoot('src/main.js'),
  plugins: [
    resolve(),
    commonjs(),
    babel(babelConfig),
    json(),
    alias({
      extensions: config.webpack.resolve.extensions,
      entries: config.webpack.resolve.alias
    })
  ],
  output: [
    { file: resolveToCurrentRoot('lib.js'), format: 'cjs' },
    { file: resolveToCurrentRoot('lib.min.js'), format: 'cjs', plugins: [terser()] },
    { file: resolveToCurrentRoot('lib.esm.js'), format: 'esm' }
  ]
};
