const path = require('path');
const fs = require('fs');

// 当前命令执行的路径
const currentRoot = () => fs.realpathSync(process.cwd());

const resolveToCurrentRoot = (filePath) =>
  path.resolve(currentRoot(), filePath);

const currentSrc = () => resolveToCurrentRoot('src');
const currentBuild = () => resolveToCurrentRoot('build');
const currentPackageJson = () => resolveToCurrentRoot('package.json');

module.exports = {
  currentRoot,
  resolveToCurrentRoot,
  resolve: resolveToCurrentRoot,
  currentSrc,
  currentBuild,
  currentPackageJson,
};
