const path = require('path');
const ora = require('ora');
const gitClone = require('git-clone');
const rm = require('rimraf').sync;
const { resolveToCurrentRoot } = require('../utils/pathUtils');
const { curConsoleTag } = require('./akfunParams');

function _gitClone(gitUrl, dir, callback, _consoleTag) {
  const consoleTag = _consoleTag || curConsoleTag;
  const spinner = ora(`${consoleTag}正在加载项目模板...`).start();
  gitClone(
    gitUrl,
    resolveToCurrentRoot(dir),
    {
      checkout: 'master'
    },
    (err) => {
      if (err === undefined) {
        rm(resolveToCurrentRoot(path.resolve(dir, '.git')));
        spinner.succeed(`${consoleTag}项目模板加载完成！`);
        callback();
      } else {
        spinner.fail(err);
        callback(err);
      }
    }
  );
}
module.exports = _gitClone;
