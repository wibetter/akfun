// 获取当前项目的package文件
const { catchCurPackageJson } = require('../utils/pathUtils');
const getConfigObj = require('../utils/getConfigObj');
const currentPackageJsonDir = catchCurPackageJson();
const currentPackageJson = getConfigObj(currentPackageJsonDir);

let consoleTag = '[akfun]'; // 输出标记

function setConsoleTag(newText) {
  consoleTag = newText;
}

const buildBanner = [
  `${currentPackageJson.name} v${currentPackageJson.version}`,
  `author: ${currentPackageJson.author}`,
  `build tool: AKFun`,
  `build time: ${new Date().toString()}`,
  `build tool info: https://github.com/wibetter/akfun`
].join('\n');

module.exports = {
  buildBanner,
  get curConsoleTag() {
    return consoleTag;
  },
  setConsoleTag
};
