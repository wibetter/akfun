const ora = require('ora');
const rollup = require('rollup');
const config = require('./config/index'); // 引入当前项目配置文件
// const rollupConfig = require('./config/rollup.config-v1.mjs'); // rollup的配置文件
import rollupConfig from './config/rollup.config-v1'; // rollup的配置文件
const { isArray, isObject } = require('./utils/typeof');

async function build(options) {
  // create a bundle
  const bundle = await rollup.rollup({
    input: options.input,
    /** 直接使用webpack中的externals配置（避免再新增一个rollup对应的配置，增加用户的配置复杂度） */
    external: config.webpack.externals,
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
module.exports = function () {
  const spinner = ora('[akfun]开启esm lib库的构建能力...').start();
  const curRollupConfig = rollupConfig; // 默认配置
  const build2esm = config.build2esm; // 用户的项目配置
  if (build2esm && build2esm.input) {
    curRollupConfig.input = build2esm.input;
  }
  if (build2esm && build2esm.output) {
    curRollupConfig.output = build2esm.output;
  }
  build(curRollupConfig);
  spinner.succeed('[akfun]esm lib库构建完成');
  /*// create a bundle
  rollup.rollup(curRollupConfig).then(() => {
    spinner.succeed('[akfun]esm lib库构建完成');
  });*/
};
