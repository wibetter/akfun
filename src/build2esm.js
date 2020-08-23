const ora = require('ora');
const rollup = require('rollup');
const config = require('./config/index'); // 引入当前项目配置文件
const rollupConfig = require('./config/rollup.config'); // rollup的配置文件

async function build(options) {
  // create a bundle
  const bundle = await rollup.rollup(options);

  console.log(bundle.imports); // an array of external dependencies
  console.log(bundle.exports); // an array of names exported by the entry point
  console.log(bundle.modules); // an array of module objects

  // or write the bundle to disk
  await bundle.write(options);
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
  /*// create a bundle
  rollup.rollup(curRollupConfig).then(() => {
    spinner.succeed('[akfun]esm lib库构建完成');
  });*/
};
