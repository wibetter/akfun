const path = require('path');
const fs = require('fs');

// 当前命令执行的路径
const currentRoot = () => fs.realpathSync(process.cwd());
const resolveToCurrentRoot = (filePath) => path.resolve(currentRoot(), filePath);
const resolveToCurrentDist = (filePath) => path.resolve(currentRoot(), 'dist/', filePath);
const currentSrc = () => resolveToCurrentRoot('src');
const currentBuild = () => resolveToCurrentRoot('build');
// 获取当前项目的package文件（从当前命令执行的路径下查找）
const catchCurPackageJson = () => resolveToCurrentRoot('package.json');

module.exports = {
  currentRoot,
  resolveToCurrentRoot,
  resolveToCurrentDist,
  resolve: resolveToCurrentRoot,
  currentSrc,
  currentBuild,
  catchCurPackageJson
};
