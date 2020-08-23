// rollup.config.js
const path = require('path');
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve'; // 支持node中的文件导入
import commonjs from '@rollup/plugin-commonjs'; // 识别cmd模块
import json from '@rollup/plugin-json'; // 识别json类型文件
import { terser } from 'rollup-plugin-terser'; // 压缩

const babelConfig = require('./babel.config'); // Babel的配置文件

// 统一路径解析
function resolveToCurrentRoot(filePath) {
  return path.resolve(process.cwd(), filePath);
}

module.exports = {
  input: resolveToCurrentRoot('src/main.js'),
  plugins: [commonjs(), babel(babelConfig), json(), resolve()],
  output: [
    { file: resolveToCurrentRoot('lib.js'), format: 'cjs' },
    { file: resolveToCurrentRoot('lib.min.js'), format: 'cjs', plugins: [terser()] },
    { file: resolveToCurrentRoot('lib.esm.js'), format: 'esm' }
  ]
};
