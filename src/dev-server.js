const open = require('open');
const ora = require('ora');
const path = require('path');
const https = require('https');
const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const portfinder = require('portfinder');
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
    // 优先使用参数中的config配置
    config = deepMergeConfig(defaultConfig, akfunConfig);
  }
  const curEnvConfig = config.dev;
  // 检查当前npm版本号是否匹配
  checkVersion();
  const spinner = ora(`${consoleTag}开启调试模式...`).start();
  /**
   * 如果 Node 的环境无法判断当前是 dev / product 环境
   * 使用 curEnvConfig.NODE_ENV 作为当前的环境
   */
  if (!process.NODE_ENV) {
    process.NODE_ENV = curEnvConfig.NODE_ENV;
    // 此时process.NODE_ENV = ‘development’;
  }

  // default port where dev server listens for incoming traffic
  // 如果没有指定运行端口，使用 curEnvConfig.port 作为运行端口
  const port = process.env.PORT || curEnvConfig.port;

  // automatically open browser, if not set will be false
  // 是否自动打开浏览器
  const autoOpenBrowser = !!curEnvConfig.autoOpenBrowser;

  // 使用 express 启动一个服务
  const app = express();

  // 获取开发环境的webpack基本配置
  const webpackConfig = getDevWebpackConfig(config);

  // Define HTTP proxies to your custom API backend
  // https://github.com/chimurai/http-proxy-middleware
  // 使用 curEnvConfig.proxyTable 的配置作为 proxyTable 的代理配置
  // 备注：需放connect-history-api-fallback前面，避免get请求的代理失效
  const proxyTable = curEnvConfig.proxyTable;
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
  // 备注：需放express.static前面，避免失效
  app.use(require('connect-history-api-fallback')());

  // serve pure public assets
  // 拼接 public 文件夹的静态资源路径
  const staticPath = path.posix.join(
    curEnvConfig.assetsPublicPath,
    curEnvConfig.assetsSubDirectory
  );
  app.use(staticPath, express.static(resolve('public')));

  const compiler = webpack(webpackConfig); // 启动 webpack 进行编译

  // 启动 webpack-dev-middleware，将编译后的文件暂存到内存中
  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: true
  });

  // serve webpack bundle output
  app.use(devMiddleware);

  if (!curEnvConfig.closeHotReload) {
    // 启动 webpack-hot-middleware，也就是我们常说的 Hot-reload
    const hotMiddleware = require('webpack-hot-middleware')(compiler, {
      log: false,
      heartbeat: 2000
    });

    // enable hot-reload and state-preserving
    // compilation error display
    app.use(hotMiddleware);
  }

  const afterCreateServerAction = (isHttps, port) => {
    spinner.succeed(`${consoleTag}调试模式已开启！`);

    process.env.PORT = port;

    const uri = isHttps
      ? `https://${curEnvConfig.hostname}`
      : `http://${curEnvConfig.hostname}:${port}`;

    console.log(`> Listening at ${uri}\n`);

    // 打印当前环境中的首个html和css地址
    const projPath = `${uri}${webpackConfig.output.publicPath}`;

    let entryConfig = webpackConfig.entry || {}; // 获取构建入口配置
    const entryFiles = (entryConfig && Object.keys(entryConfig)) || [];
    if (entryFiles.length > 0) {
      // 获取第一个入口文件
      const filename = entryFiles[0];
      const consoleInfo = curEnvConfig.consoleInfo || '当前运行脚本';

      if (curEnvConfig.cssExtract || curEnvConfig.cssExtract === undefined) {
        console.info(
          `${consoleInfo}:\n ${projPath}${filename}.js\n当前可用样式[可能不存在]:\n${projPath}${filename}.css`
        );
      } else {
        console.info(`${consoleInfo}:\n ${projPath}${filename}.js`);
      }
      // 是否自动打开浏览器并跳转到第一个入口页面
      if (!curEnvConfig.closeHtmlWebpackPlugin && autoOpenBrowser) {
        open(`${projPath}${filename}.html`, { wait: true });
      }
    }
  };

  if (curEnvConfig.https) {
    const sslOptions = {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/localhost.cert')),
      requestCert: false,
      rejectUnauthorized: false
    };

    var httpsServer = https.createServer(sslOptions, app);

    devMiddleware.waitUntilValid(() => {
      httpsServer.listen(443, () => {
        afterCreateServerAction(true, port);
      });
    });
  } else {
    portfinder.basePort = port;
    devMiddleware.waitUntilValid(() => {
      portfinder.getPort((err, port) => {
        if (err) {
          _reject(err);
        }

        app.listen(port, () => {
          afterCreateServerAction(false, port);
        });
      });
    });
  }
};
