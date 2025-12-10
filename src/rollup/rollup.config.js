// rollup.config.js
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // 支持node中的文件导入
const jsx = require('rollup-plugin-jsx'); // 用于处理jsx
const typescript = require('@rollup/plugin-typescript'); // 支持ts
const commonjs = require('@rollup/plugin-commonjs'); // 识别cmd模块
const vue = require('rollup-plugin-vue');
const json = require('@rollup/plugin-json'); // 识别json类型文件
const image = require('@rollup/plugin-image'); // 图片处理器
const terser = require('@rollup/plugin-terser'); // 压缩
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
// 处理svg文件
const svgr = require('@svgr/rollup');
const { nodeExternals } = require('rollup-plugin-node-externals');
const { resolveToCurrentRoot, resolveToCurrentDist } = require('../utils/pathUtils'); // 统一路径解析
const babelConfig = require('../config/babel.config'); // Babel的配置文件
const { buildBanner } = require('../utils/akfunParams');

/**
 * 用于生成 rollup 配置
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
 * - svgDir: svg文件输出目录
 * - plugins: 自定义rollup插件
 * - babelPlugins: 自定义babel插件
 */
module.exports = function (curConfig, curEnvConfig) {
  const curWebpackConfig = curConfig.webpack || {};
  const buildType = curEnvConfig.type || 'ts';
  const buildFormat = curEnvConfig.format || 'esm';
  // 获取用户配置的构建入口文件
  let rollupInput = resolveToCurrentRoot('src/main.js');
  if (curEnvConfig.input) {
    rollupInput = curEnvConfig.input;
  }
  let curFileName = 'index'; // 默认以"index.esm.js"输出
  // 获取用户配置的构建输出文件名
  if (curEnvConfig.fileName) {
    curFileName = curEnvConfig.fileName;
  }
  // 增加babel配置
  babelConfig.babelHelpers = 'runtime';

  // 判断是否有自定义 Babel plugins
  if (curWebpackConfig.babelPlugins && Array.isArray(curWebpackConfig.babelPlugins)) {
    // 添加自定义webpack插件
    babelConfig.plugins.push(...curWebpackConfig.babelPlugins);
  }

  return {
    banner: buildBanner,
    input: rollupInput,
    plugins: [
      alias({
        entries: Object.entries(curConfig.webpack.resolve.alias || {}).map(
          ([find, replacement]) => ({
            find,
            replacement
          })
        )
      }),
      /**
       * excludeList（在akfun.config.js中配置）
       * 设置打包中应该排除的依赖
       */
      nodeExternals({
        include: curEnvConfig.excludeList || []
        // exclude: ['./**', '../**'], // 排除所有相对路径模块
        // deps: true, // 只标记 node_modules 中的依赖
        // devDeps: false, // 不标记 devDependencies
        // peerDeps: true, // 标记 peerDependencies
      }),
      /**
       * nodeResolve 插件用于解析模块路径
       * extensions: 默认识别的文件后缀列表
       * 默认值（来自 webpack.resolve.extensions）: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
       * 如果不配置此插件，Rollup 默认只识别 .js 和 .mjs 文件
       */
      nodeResolve({
        extensions: curConfig.webpack.resolve.extensions
      }),
      buildType === 'ts'
        ? typescript({
            // 是否生成声明文件（默认 false）
            declaration: curEnvConfig.declaration !== undefined ? curEnvConfig.declaration : false,
            declarationDir: curEnvConfig.declarationDir || './dist/types'
          })
        : undefined,
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        ...babelConfig
      }), // 备注，需要先babel()再commjs()
      buildType === 'ts' ? undefined : jsx({ factory: 'React.createElement' }),
      vue(),
      commonjs({
        transformMixedEsModules: true, // 转换混合的 ES 模块和 CommonJS 模块
        strictRequires: true, // 严格模式处理 require，确保所有 require 都被正确处理
        ignoreDynamicRequires: true // 忽略动态 require
      }),
      postcss({
        extensions: ['.css', '.scss', '.sass', '.styl', '.stylus', '.less'],
        // Or with custom file name, it will generate file relative to bundle.js in v3
        extract: resolveToCurrentDist(`${curFileName}.css`, curEnvConfig.outDir),
        plugins: [
          simplevars(),
          nested(),
          // cssnext({ warnForDuplicates: false, }),
          postcssPresetEnv(),
          cssnano()
        ]
      }),
      // https://react-svgr.com/docs/options/
      svgr({
        svgProps: {
          className: 'icon'
        },
        prettier: false,
        dimensions: false
      }),
      image({
        exclude: [curEnvConfig.svgDir || 'src/icons/**']
      }),
      json()
    ],
    output: [
      {
        file: resolveToCurrentDist(`${curFileName}.${buildFormat}.js`, curEnvConfig.outDir),
        format: buildFormat,
        notCompressed: true // 不压缩代码
      },
      {
        file: resolveToCurrentDist(`${curFileName}.${buildFormat}.min.js`, curEnvConfig.outDir),
        format: buildFormat,
        plugins: [terser()]
      }
    ]
  };
};
