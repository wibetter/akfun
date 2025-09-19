const ora = require('ora');
const rollup = require('rollup');
const { terser } = require('rollup-plugin-terser'); // 压缩
const projectConfig = require('./config/index'); // 引入当前项目配置文件
const defaultConfig = require('./config/default.config');
const rollupConfig = require('./config/rollup.config'); // rollup的配置文件
const { isArray, isObject } = require('./utils/typeof');
const { curConsoleTag } = require('./utils/akfunParams');
const deepMergeConfig = require('./utils/deepMergeConfig');

async function build2esmFunc(options, curConfig) {
  // create a bundle
  const bundle = await rollup.rollup({
    input: options.input,
    external: options.externals,
    plugins: options.plugins
  });

  if (isArray(options.output)) {
    options.output.map((outputItem) => {
      bundle.write(outputItem);
    });
  } else if (isObject(options.output)) {
    // or write the bundle to disk
    await bundle.write(options.output);
  }
}

// 构建脚本：一般用于构建生产环境的代码
module.exports = function (fileName, akfunConfig, _consoleTag) {
  const consoleTag = _consoleTag || curConsoleTag;
  let config = projectConfig; // 默认使用执行命令目录下的配置数据
  if (akfunConfig) {
    // 参数中的config配置优先级最高
    config = deepMergeConfig(defaultConfig, akfunConfig);
  }
  const spinner = ora(`${consoleTag}开启esm模块构建能力...`).start();
  const curRollupConfig = rollupConfig(fileName, config); // 默认配置
  const build2esm = config.build2esm; // 用户的项目配置
  const curWebpackConfig = config.webpack;
  const compress = build2esm.compress ?? true; // 是否压缩代码
  if (build2esm && build2esm.input) {
    curRollupConfig.input = build2esm.input;
  }

  // 处理 externals，用户手动添加要剔除的依赖
  let externals = []; // rollup 的 externals 是数组格式

  const webpackExternal = curWebpackConfig.external;
  if (webpackExternal && isArray(webpackExternal)) {
    externals = externals.concat(webpackExternal);
  } else if (webpackExternal && isObject(webpackExternal)) {
    externals = externals.concat(Object.keys(webpackExternal));
  }

  const build2esmExternal = build2esm.external;
  if (build2esmExternal && isArray(build2esmExternal)) {
    externals = externals.concat(build2esmExternal);
  } else if (build2esmExternal && isObject(build2esmExternal)) {
    externals = externals.concat(Object.keys(build2esmExternal));
  }

  // 添加到 rollup 配置中
  curRollupConfig.externals = externals;

  if (build2esm && build2esm.output) {
    curRollupConfig.output = build2esm.output;

    if (isArray(build2esm.output)) {
      build2esm.output.map((outputItem) => {
        if (!outputItem.plugins && compress) {
          outputItem.plugins = [terser()];
        }
      });
    } else if (isObject(build2esm.output) && !build2esm.output.plugins && compress) {
      build2esm.output.plugins = [terser()];
    }
  }
  build2esmFunc(curRollupConfig, config).then(() => {
    spinner.succeed(`${consoleTag}esm模块构建完成。`);
  });
};
