// rollup.config.js
const { babel } = require('@rollup/plugin-babel');
const { nodeResolve } = require('@rollup/plugin-node-resolve'); // 支持node中的文件导入
const jsx = require('rollup-plugin-jsx'); // 用于处理jsx
const typescript = require('@rollup/plugin-typescript'); // 支持ts
const commonjs = require('@rollup/plugin-commonjs'); // 识别cmd模块
const vue = require('rollup-plugin-vue');
const json = require('@rollup/plugin-json'); // 识别json类型文件
const image = require('@rollup/plugin-image'); // 图片处理器
const { terser } = require('@rollup/plugin-terser'); // 压缩
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
const { externals } = require('rollup-plugin-node-externals');
const { resolveToCurrentRoot, resolveToCurrentDist } = require('../utils/pathUtils'); // 统一路径解析
const babelConfig = require('./babel.config'); // Babel的配置文件
const projectConfig = require('./index'); // 引入当前项目配置文件
const { buildBanner } = require('../utils/akfunParams');

module.exports = function (fileName, akfunConfig) {
  const curConfig = akfunConfig || projectConfig;
  const build2esm = curConfig.build2esm || {};
  const curWebpackConfig = curConfig.webpack || {};
  const buildType = build2esm.type || 'ts';
  // 获取用户配置的构建入口文件
  let rollupInput = resolveToCurrentRoot('src/main.js');
  if (build2esm.input) {
    rollupInput = build2esm.input;
  }
  let curFileName = fileName || 'index'; // 默认以"index.esm.js"输出
  // 获取用户配置的构建输出文件名
  if (build2esm.fileName) {
    curFileName = build2esm.fileName;
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
    // format: build2esm.format || 'esm', // 生成包的格式
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
      externals({
        include: build2esm.excludeList || []
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
            declaration: build2esm.declaration !== undefined ? build2esm.declaration : false,
            declarationDir: build2esm.declarationDir || './dist/types'
          })
        : undefined,
      babel(babelConfig), // 备注，需要先babel()再commjs()
      // jsx( {factory: 'React.createElement'} ),
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
        extract: resolveToCurrentDist(`${curFileName}.css`, build2esm.outDir),
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
        exclude: [build2esm.svgDir || 'src/icons/**']
      }),
      json()
    ],
    output: [
      {
        file: resolveToCurrentDist(`${curFileName}.esm.js`, build2esm.outDir),
        format: 'esm'
      },
      {
        file: resolveToCurrentDist(`${curFileName}.esm.min.js`, build2esm.outDir),
        format: 'esm',
        plugins: [terser()]
      }
    ]
  };
};
