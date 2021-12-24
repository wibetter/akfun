const { resolveToCurrentRoot } = require('./pathUtils');
const { isArray, isString } = require('../utils/typeof');

module.exports = (_projectDir) => {
  const curProjectDir = [];
  if (!_projectDir) {
    curProjectDir.push(resolveToCurrentRoot('./src'));
  } else if (isArray(_projectDir)) {
    _projectDir.forEach((dir) => {
      curProjectDir.push(resolveToCurrentRoot(dir));
    });
  } else if (isString(_projectDir)) {
    curProjectDir.push(resolveToCurrentRoot(_projectDir));
  }
  return curProjectDir;
};
