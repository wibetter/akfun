// rollup.config.js
import babel from '@rollup/plugin-babel';
import babelConfig from './babel.config'; // Babel的配置文件
import path from 'path';
import resolve from '@rollup/plugin-node-resolve'; // 支持node中的文件导入
import commonjs from '@rollup/plugin-commonjs'; // 识别cmd模块
import json from '@rollup/plugin-json'; // 识别json类型文件
import { terser } from 'rollup-plugin-terser'; // 代码压缩
import alias from '@rollup/plugin-alias'; // 简写配置

const resolveToCurrentRoot = (filePath) => path.resolve(process.cwd(), filePath);

const rollupConfig = {
  input: resolveToCurrentRoot('src/main.js'),
  plugins: [
    resolve(),
    commonjs(),
    json(),
    alias({
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue','.json'], // 在构建过程中尝试过程中用到的后缀列表
      entries: {
        '@': resolveToCurrentRoot('src'),
        '$function': resolveToCurrentRoot('src/function'),
        '$utils': resolveToCurrentRoot('src/utils'),
        '$data': resolveToCurrentRoot('src/data')
      },
    }),
  ],
  output: [
    { file: resolveToCurrentRoot('dist/lib.cjs.js'), format: 'cjs' },
    { file: resolveToCurrentRoot('dist/lib.esm.js'), format: 'esm' },
    { file: resolveToCurrentRoot('dist/lib.cjs.min.js'), format: 'cjs', plugins: [terser()] },
    { file: resolveToCurrentRoot('dist/lib.esm.min.js'), format: 'esm', plugins: [terser()] }
  ]
};

export default rollupConfig;
