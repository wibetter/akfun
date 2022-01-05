const opn = require('opn');
const ora = require('ora');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const checkVersion = require('./check-versions');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { resolve } = require('./utils/pathUtils');
// 引入当前项目配置文件
const projectConfig = require('./config/index');
const defaultConfig = require('./config/default.config');
const getDevWebpackConfig = require('./webpack/webpack.dev.conf');
const deepMergeConfig = require('./utils/deepMergeConfig');
const { curConsoleTag } = require('./utils/akfunParams');

// 构建脚本：一般用于构建开发环境的代码（包含热更新、接口代理等功能）
module.exports = function (akfunConfig, _consoleTag) {
  const consoleTag = _consoleTag || curConsoleTag;
  let config = projectConfig; // 默认使用执行命令目录下的配置数据
  if (akfunConfig) {
    // 参数中的config配置优先级最高
    config = deepMergeConfig(defaultConfig, akfunConfig);
  }
  // 检查当前npm版本号是否匹配
  checkVersion();
  const spinner = ora(`${consoleTag}开启调试模式...`).start();
  /**
   * 如果 Node 的环境无法判断当前是 dev / product 环境
   * 使用 config.dev.NODE_ENV 作为当前的环境
   */
  if (!process.NODE_ENV) {
    process.NODE_ENV = config.dev.NODE_ENV;
    // 此时process.NODE_ENV = ‘development’;
  }

  // default port where dev server listens for incoming traffic
  // 如果没有指定运行端口，使用 config.dev.port 作为运行端口
  const port = process.env.PORT || config.dev.port;

  // automatically open browser, if not set will be false
  // 是否自动打开浏览器
  const autoOpenBrowser = !!config.dev.autoOpenBrowser;

  // 使用 express 启动一个服务
  const app = express();
  // 获取开发环境的webpack基本配置
  const webpackConfig = getDevWebpackConfig(config);
  const compiler = webpack(webpackConfig); // 启动 webpack 进行编译

  // 启动 webpack-dev-middleware，将编译后的文件暂存到内存中
  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  });

  // 启动 webpack-hot-middleware，也就是我们常说的 Hot-reload
  const hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: false,
    heartbeat: 2000
  });

  // enable hot-reload and state-preserving
  // compilation error display
  app.use(hotMiddleware);

  // Define HTTP proxies to your custom API backend
  // https://github.com/chimurai/http-proxy-middleware
  // 使用 config.dev.proxyTable 的配置作为 proxyTable 的代理配置
  const proxyTable = config.dev.proxyTable;
  if (proxyTable && JSON.stringify(proxyTable) !== '{}') {
    // 将 proxyTable 中的请求配置挂在到启动的 express 服务上
    // proxy api requests
    Object.keys(proxyTable).forEach((context) => {
      let options = proxyTable[context];
      if (typeof options === 'string') {
        options = { target: options };
      }
      app.use(context, createProxyMiddleware(options));
    });
  }

  // 使用 connect-history-api-fallback 匹配资源，如果不匹配就可以重定向到指定地址
  // handle fallback for HTML5 history API
  app.use(require('connect-history-api-fallback')());

  // serve webpack bundle output
  app.use(devMiddleware);

  // serve pure public assets
  // 拼接 public 文件夹的静态资源路径
  const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory);

  app.use(staticPath, express.static(resolve('public')));

  let _resolve;
  let _reject;
  const readyPromise = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  let server;
  const portfinder = require('portfinder');
  portfinder.basePort = port;

  console.log('\n> Starting dev server...');

  devMiddleware.waitUntilValid(() => {
    portfinder.getPort((err, port) => {
      if (err) {
        _reject(err);
      }
      process.env.PORT = port;
      const uri = `http://${config.dev.hostname}:${port}`;

      console.log(`> Listening at ${uri}\n`);
      // 如果是开发环境，自动打开浏览器并跳到项目首页
      if (autoOpenBrowser) {
        spinner.succeed(`${consoleTag}调试模式已开启！`);
        // 打印当前环境中的首个html和css地址
        const projPath = `${uri}${webpackConfig.output.publicPath}`;
        let entryConfig = webpackConfig.entry || {}; // 获取构建入口配置
        const entryFiles = (entryConfig && Object.keys(entryConfig)) || [];
        if (entryFiles.length > 0) {
          // 获取第一个入口文件
          const filename = entryFiles[0];
          console.info(
            `当前运行脚本:\n ${projPath}${filename}.js\n当前运行样式[可能不存在]:\n${projPath}${filename}.css`
          );
          opn(`${projPath}${filename}.html`);
        }
      }
      server = app.listen(port);
      _resolve();
    });
  });
};
