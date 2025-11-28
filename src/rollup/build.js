const ora = require('ora');
const rollup = require('rollup');
const terser = require('@rollup/plugin-terser'); // 压缩
const { isArray, isObject } = require('../utils/typeof');
const { curConsoleTag } = require('../utils/akfunParams');

async function rollupBuildFunc(envConfig, curConfig) {
  // create a bundle
  const bundle = await rollup.rollup({
    input: envConfig.input,
    external: envConfig.external || envConfig.externals, // 兼容新旧两种写法
    plugins: envConfig.plugins
  });

  if (isArray(envConfig.output)) {
    // 等待所有输出完成
    await Promise.all(envConfig.output.map((outputItem) => bundle.write(outputItem)));
  } else if (isObject(envConfig.output)) {
    // or write the bundle to disk
    await bundle.write(envConfig.output);
  }

  // 关闭 bundle 以释放资源
  await bundle.close();
}

/**
 * 用于构建 node 模块
 * @param {*} config: akfun 配置文件
 * @param {*} envConfig: 当前环境配置
 * @param {*} _rollupConfig: 自定义 rollup 配置
 * @param {*} _consoleTag 控制台输出标签
 */
module.exports = function (config, envConfig, _rollupConfig, _consoleTag) {
  const consoleTag = _consoleTag || curConsoleTag;
  const curRollupConfig = _rollupConfig;
  const curWebpackConfig = config.webpack;
  const buildFormat = envConfig.format || 'esm';
  const compress = envConfig.compress ?? true; // 是否压缩代码
  if (envConfig && envConfig.input) {
    curRollupConfig.input = envConfig.input;
  }

  // 处理 externals，用户手动添加要剔除的依赖
  let externals = []; // rollup 的 externals 是数组格式

  const webpackExternals = curWebpackConfig.externals || curWebpackConfig.external;
  if (webpackExternals && isArray(webpackExternals)) {
    externals = externals.concat(webpackExternals);
  } else if (webpackExternals && isObject(webpackExternals)) {
    externals = externals.concat(Object.keys(webpackExternals));
  }

  const curExternal = envConfig.external;
  if (curExternal && isArray(curExternal)) {
    externals = externals.concat(curExternal);
  } else if (curExternal && isObject(curExternal)) {
    externals = externals.concat(Object.keys(curExternal));
  }

  // 添加到 rollup 配置中（rollup 使用 external 而不是 externals）
  curRollupConfig.external = externals;

  if (envConfig && envConfig.output) {
    curRollupConfig.output = envConfig.output;
  }
  if (compress && isArray(curRollupConfig.output)) {
    curRollupConfig.output.map((outputItem) => {
      if (!outputItem.plugins) {
        outputItem.plugins = [terser()];
      } else {
        outputItem.plugins.push(terser());
      }
    });
  } else if (compress && isObject(curRollupConfig.output)) {
    if (!curRollupConfig.plugins) {
      curRollupConfig.output.plugins = [terser()];
    } else {
      curRollupConfig.plugins.push(terser());
    }
  }
  const spinner = ora(`${consoleTag}开启${buildFormat}模块构建模式...`).start();
  rollupBuildFunc(curRollupConfig, config).then(() => {
    spinner.succeed(`${consoleTag}${buildFormat}模块构建完成。`);
  });
};
