const fs = require('fs');
const path = require('path');
// 样式
const chalk = require('chalk');
const suceessTip = function (msg) {
  console.log(chalk.green('*') + ' ' + msg);
};
// 创建配置文件: 从configPath复制到configDist
const createFile = function (configPath, configDist, projectName) {
  fs.readFile(configPath, 'utf8', function (err, configText) {
    let newConfigText = configText;
    if (projectName) {
      newConfigText = configText.replace(/#projectName#/g, projectName);
    }
    const configFile = path.parse(configDist);
    const configFileDir = configFile.dir.replace(/\\/g, '/');
    fs.exists(configFileDir, function (exist) {
      if (!exist) {
        fs.mkdir(configFileDir, function () {
          // 创建目录
          suceessTip('创建目录：' + configFileDir);
          fs.writeFile(configDist, newConfigText, (err) => {
            if (err) {
              throw Error(err);
            }
            suceessTip('创建配置文件：' + configDist);
          });
        });
      } else {
        fs.writeFile(configDist, newConfigText, (err) => {
          if (err) {
            throw Error(err);
          }
          suceessTip('创建配置文件：' + configDist);
        });
      }
    });
  });
};

module.exports = createFile;
