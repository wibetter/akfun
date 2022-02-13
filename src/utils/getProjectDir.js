const { resolveToCurrentRoot } = require('./pathUtils');
const { isArray, isString } = require('../utils/typeof');

module.exports = (_projectDir) => {
  const curProjectDir = [];
  if (!_projectDir) {
    curProjectDir.push(resolveToCurrentRoot('./src'));
  } else if (isArray(_projectDir)) {
    _projectDir.forEach((dir) => {
      if (dir.indexOf('/') === 0) {
        // 判断是否是绝对路径
        curProjectDir.push(dir);
      } else {
        curProjectDir.push(resolveToCurrentRoot(dir));
      }
    });
  } else if (isString(_projectDir)) {
    if (_projectDir.indexOf('/') === 0) {
      // 判断是否是绝对路径
      curProjectDir.push(_projectDir);
    } else {
      curProjectDir.push(resolveToCurrentRoot(_projectDir));
    }
  }
  return curProjectDir;
};
