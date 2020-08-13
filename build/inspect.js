const chalk = require('chalk');
const path = require('path');
const ora = require('ora');
const fs = require('fs');
const getCurWebpackConfig = require('./getCurWebpackConfig.js'); // 用于获取当前webpack配置的方法

const suceessTip = function(msg) {
  console.log(chalk.green('*') + ' ' + msg);
};

// 根据当前配置文件内容创建指定名称的文件
const createConfigJs = function (fileCont, fileName) {
  let filePath = path.resolve(process.cwd(), fileName);

  fs.writeFile(filePath, JSON.stringify(fileCont, null, 2), (err) => {
    if (err) {
      throw Error(err);
    }
  });
};

/**
 * 用于输出当前项目配置文件
 */
module.exports = (type) => {
  const spinner = ora(  '[akfun]正在获取当前环境的配置数据...').start();
  if (type === 'dev') {
    const devConfig = getCurWebpackConfig(type);
    createConfigJs(devConfig, 'akfun-dev-config.js');
    spinner.succeed(  '[akfun]当前配置数据已输出至akfun-dev-config.js中！');
  } else if (type === 'lib') {
    const prodConfig = getCurWebpackConfig(type);
    createConfigJs(prodConfig, 'akfun-build2lib-config.js');
    spinner.succeed(  '[akfun]当前配置数据已输出至akfun-build2lib-config.js中！');
  } else if (type === 'build') {
    const libraryConfig = getCurWebpackConfig(type);
    // 默认输出生产环境的配置文件
    createConfigJs(libraryConfig, 'akfun-build-config.js');
    spinner.succeed(  '[akfun]当前配置数据已输出至akfun-build-config.js中！');
  } else {
    console.log(`不能识别type=${type}。`)
  }
};
