const ora = require('ora');
const rm = require('rimraf');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const checkVersion = require('./check-versions');
const config = require('./config/index'); // 引入当前项目配置文件

// 构建脚本：一般用于构建生产环境的代码
module.exports = function (BuildType) {
  // 检查当前npm版本号是否匹配
  checkVersion();
  const spinner = ora('[akfun]开启AKFun构建能力...').start();
  // 引入生产环境配置信息
  let webpackConfig;
  // 根据BuildType判断是否引用专用于第三方功能包的webpack配置
  if (BuildType && BuildType === 'lib') {
    spinner.start('[akfun]开始构建第三方功能包...');
    webpackConfig = require('./webpack/webpack.library.conf');
  } else {
    spinner.start('[akfun]开始构建生产环境的代码...');
    webpackConfig = require('./webpack/webpack.prod.conf');
  }

  /**
   * 如果 Node 的环境无法判断当前是 dev / product 环境
   * 使用 config.dev.NODE_ENV 作为当前的环境
   */
  if (!process.NODE_ENV) {
    process.NODE_ENV = config.build.NODE_ENV; // 将运行环境设置为生产环境
  }

  rm(
    path.join(config.build.assetsRoot, config.build.assetsSubDirectory),
    (err) => {
      if (err) throw err;
      webpack(webpackConfig, (err, stats) => {
        spinner.stop();
        if (err) throw err;
        process.stdout.write(
          `${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
          })}\n\n`,
        );

        if (stats.hasErrors()) {
          console.log(chalk.red('  构建失败.\n'));
          process.exit(1);
        }

        console.log(chalk.cyan('  构建完成.\n'));
        console.log(
          chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
              "  Opening index.html over file:// won't work.\n",
          ),
        );
      });
    },
  );
};
