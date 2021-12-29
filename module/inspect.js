const path = require('path');
const ora = require('ora');
const fs = require('fs');
const {curConsoleTag} = require("../src/utils/akfunParams");
const getCurWebpackConfig = require('../src/utils/getCurWebpackConfig.js'); // 用于获取当前webpack配置的方法

// 根据当前配置文件内容创建指定名称的文件
const createConfigJs = function (fileName, fileCont) {
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
module.exports = (type, _consoleTag) => {
  const consoleTag = _consoleTag || curConsoleTag;
  const spinner = ora(  `${consoleTag}正在获取当前环境的配置数据...`).start();
  if (type === 'dev') {
    const devConfig = getCurWebpackConfig(type);
    createConfigJs('current-akfun-dev-config.js', devConfig);
    spinner.succeed(  `${consoleTag}当前配置数据已输出至akfun-dev-config.js中！`);
  } else if (type === 'lib') {
    const libraryConfig = getCurWebpackConfig(type);
    createConfigJs('current-akfun-build2lib-config.js', libraryConfig);
    spinner.succeed(  `${consoleTag}当前配置数据已输出至akfun-build2lib-config.js中！`);
  } else if (type === 'build') {
    const prodConfig = getCurWebpackConfig(type);
    // 默认输出生产环境的配置文件
    createConfigJs('current-akfun-build-config.js', prodConfig);
    spinner.succeed(  `${consoleTag}当前配置数据已输出至akfun-build-config.js中！`);
  } else {
    spinner.fail(`${consoleTag}type不能为空。`);
  }
};
