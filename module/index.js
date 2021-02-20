/**
 * 命令式参数识别
 */
const figlet = require('figlet'); // 用于输出图形文字
const yargs = require('yargs'); // 命令行工具
const chalk = require('chalk'); // 带样式的log输出
const inquirer = require('inquirer'); // 问答式交互

// 引入本地脚本模块
const akfunInit = require('./akfunInit.js');
const akfunConfigInit = require('../src/utils/akfunConfigInit.js');
const inspect = require('./inspect.js');
const mainAction = require('./main.js'); // 功能入口

// akfun的package文件
const akfunPackage = require('../package');

const titleTip = function (msg) {
  return chalk.green(chalk.bold(msg));
};

// 脚手架名字输出
const bigTip = figlet.textSync('AKFun', {
  font: 'lean',
});

console.log(chalk.green(bigTip));
console.log(chalk.green(`当前版本：v${akfunPackage.version}.\n`));

let argv = yargs
  .command(
    'init [options]',
    '创建一个项目',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 init [options]')
        .option('type', {
          alias: 't',
          describe: '项目类型（vue技术栈/react技术栈/library库',
        })
        .option('dir', {
          alias: 'd',
          describe: '项目路径',
        })
        .option('name', {
          alias: 'n',
          describe: '项目名称',
          default: 'myProject',
        })
        .alias('h', 'help');
    },
    (argv) => {
      if (argv.type && argv.dir) {
        akfunInit(argv.type, argv.dir, argv.name);
      } else {
        const questions = [];
        // 初始化项目模板时，当用户未设置项目类型type时，以列表形式展示当前可以使用的项目模板
        if (!argv.type) {
          questions.push({
            name : 'type',
            type : 'list',
            message : '请选择您要创建的项目类型: ',
            default : 'react',
            choices : [
              {
                name : 'react项目',
                value : 'react',
                short : 'react',
              },
              {
                name : 'vue项目',
                value : 'vue',
                short : 'vue',
              },
              {
                name : 'library库',
                value : 'library',
                short : 'library',
              },
            ],
          });
        }
        // 当用户未设置存放项目的目录地址时，提示用户
        if (!argv.dir) {
          questions.push({
            name : 'dir',
            type : 'input',
            message : '请输入存放项目模板的目录名（默认存放在当前路径下）: ',
            default : 'akfunProject',
          });
        }
        inquirer.prompt(questions).then(ans=>{
          akfunInit(ans.type, ans.dir, argv.name);
        })
      }
    },
  )
  .command(
    'config init',
    '初始化AKFun配置文件',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 config init')
        .alias('h', 'help');
    },
    () => {
      akfunConfigInit('akfun.config.js');
    },
  )
  .command(
    'dev',
    '开启本地调试模式',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 dev')
        .alias('h', 'help');
    },
    (argv) => {
      mainAction.dev();
    },
  )
  .command(
    'build',
    '构建生产环境的代码',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 build')
        .alias('h', 'help');
    },
    (argv) => {
      mainAction.build();
    },
  )
  .command(
    'build2lib',
    '构建第三方功能包',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 build2lib')
        .alias('h', 'help');
    },
    (argv) => {
      mainAction.build('lib'); // 构建library
    },
  )
  .command(
    'build2esm',
    '构建esm功能包',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 build2esm')
        .option('fileName', {
          alias: 'n',
          describe: '输出的文件名',
          default: 'lib',
        })
        .alias('h', 'help');
    },
    (argv) => {
      mainAction.build2esm(argv.fileName); // 构建esm
    },
  )
  .command(
    'inspect',
    '输出当前配置文件',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 inspect')
        .option('type', {
          alias: 't',
          describe: '环境类型（本地调试环境/生产环境/library构建环境）',
          default: 'build',
        })
        .alias('h', 'help');
    },
    (argv) => {
      inspect(argv.type);
    },
  )
  .alias('h', 'help')
  .alias('v', 'version')
  .help()
  .updateStrings({
    'Usage:': titleTip('Usage:'),
    'Commands:': titleTip('Commands:'),
    'Options:': titleTip('Options:'),
  }).argv;
