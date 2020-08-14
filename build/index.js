/**
 * 命令式参数识别
 */
const figlet = require('figlet');
const yargs = require('yargs'); // 命令行工具
const chalk = require('chalk'); // 样式

// 引入本地脚本模块
const akfunInit = require('./akfunInit.js');
const inspect = require('./inspect.js');
const mainAction = require('./main.js'); // 功能入口

const titleTip = function (msg) {
  return chalk.green(chalk.bold(msg));
};

// 脚手架名字输出
const bigTip = figlet.textSync('AKFun', {
  font: 'lean',
});

console.log(chalk.green(bigTip));

let argv = yargs
  .command(
    'init [options]',
    '项目初始化',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 init [options]')
        .option('type', {
          alias: 't',
          describe: '项目类型（vue技术栈/react技术栈，默认react技术栈）',
          default: 'react',
        })
        .option('dir', {
          alias: 'd',
          describe: '项目路径',
          default: './',
        })
        .option('name', {
          alias: 'n',
          describe: '项目名称',
          default: 'myProject',
        })
        .alias('h', 'help');
    },
    (argv) => {
      akfunInit(argv.type, argv.dir, argv.name);
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
        .usage(titleTip('Usage') + ': $0 online')
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
        .usage(titleTip('Usage') + ': $0 online')
        .alias('h', 'help');
    },
    (argv) => {
      mainAction.build('lib'); // 构建library
    },
  )
  .command(
    'inspect',
    '输出当前配置文件',
    (yargs) => {
      yargs
        .reset()
        .usage(titleTip('Usage') + ': $0 online')
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
