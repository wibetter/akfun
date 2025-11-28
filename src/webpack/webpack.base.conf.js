const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
// const tsImportPluginFactory = require('ts-import-plugin'); // 按需加载lib库组件代码
const StyleLintPlugin = require('stylelint-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const nodeExternals = require('webpack-node-externals');
// const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const utils = require('./loaderUtils');
const vueLoaderConfig = require('./vue-loader.conf');
const { resolve, resolveToCurrentRoot } = require('../utils/pathUtils');
const getProjectDir = require('../utils/getProjectDir');
const catchVuePages = require('../utils/catchVuePages'); // 用于获取当前项目中的vue单文件
const getProjectConfig = require('../config/index'); // 用于获取当前项目配置文件
const babelConfig = require('../config/babel.config'); // Babel的配置文件
const { buildBanner } = require('../utils/akfunParams');
const getJsEntries = require('../utils/jsEntries');
const { isArray, isFunction, isObject } = require('../utils/typeof');

// 生成构建头部信息
const BannerPack = new webpack.BannerPlugin({
  banner: buildBanner,
  entryOnly: true // 只在入口 chunks 文件中添加
});

/**
 * webpack.base.conf.js
 * 主要用于设置 rules 和 通用插件
 * _curEnvConfig: 执行环境中的配置，用于记录 dev、build、build2lib 等对应的配置内容；
 * _akfunConfig：完整的配置对象
 */
module.exports = (_curEnvConfig, _akfunConfig, buildMode = 'build') => {
  const curEnvConfig = _curEnvConfig || {}; // 用于接收当前运行环境配置变量
  let config = _akfunConfig || getProjectConfig(); // 优先使用外部传进来的项目配置
  // 获取当前项目配置文件中的webpack配置
  const curWebpackConfig = config.webpack;
  // 获取当前项目目录
  const curProjectDir = getProjectDir(curWebpackConfig.projectDir);

  // 判断是否有自定义 Babel plugins
  if (isArray(curWebpackConfig.babelPlugins)) {
    // 添加自定义babel插件
    babelConfig.plugins.push(...curWebpackConfig.babelPlugins);
  } else if (isFunction(curWebpackConfig.babelPlugins)) {
    // 处理自定义babel插件
    curWebpackConfig.babelPlugins(babelConfig.plugins);
  }

  // 获取缓存目录路径
  const cacheDirectory = resolveToCurrentRoot('./node_modules/.cache/webpack');

  const webpackConfig = {
    // Webpack 5 持久化缓存配置
    cache: {
      type: 'filesystem',
      cacheDirectory: cacheDirectory,
      buildDependencies: {
        config: [__filename] // 当配置文件改变时，使缓存失效
      },
      name: `${curEnvConfig.NODE_ENV || 'development'}--${buildMode}-cache`,
      compression: 'gzip' // 使用 gzip 压缩缓存文件以节省磁盘空间
    },
    stats: {
      // cachedModules: false,
      // providedExports: true,
      // warnings: false
    },
    entry: curWebpackConfig.entry,
    // target: 'web', // <=== 默认为 'web'，可省略
    target: ['web', 'es5'], // 使用共同的特性子集
    // target: false, // 不使用任何插件
    /*
     内置变量列表：
     id: chunk的唯一标识，从0开始；
     name: chunk的名称；
     hash: chunk的唯一标识的Hash值；
     chunkhash: chunk内容的Hash值；
     其中hash和chunkhash的长度是可以指定的，[hash:8]代表取8位的Hash值，默认是20位。
     */
    output: {
      filename: '[name].js'
    },
    watchOptions: {
      ignored: /node_modules|\.git/, // 忽略 node_modules 和 .git
      aggregateTimeout: 300 // 文件变化后延迟编译的时间(ms)
    },
    /**
     * 当webpack试图去加载模块的时候，它默认是查找以 .js 结尾的文件的
     */
    resolve: curWebpackConfig.resolve,
    externals: {},
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: vueLoaderConfig(curEnvConfig, curWebpackConfig) // 配置vue-loader相关的loader插件
            }
          ]
        },
        // 关于ts的检测：https://ts.xcatliu.com/engineering/lint.html
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                ...babelConfig,
                // Babel 缓存配置
                cacheDirectory: true, // 启用缓存
                cacheCompression: false, // 不压缩缓存文件以提升性能
                cacheIdentifier: `${curEnvConfig.NODE_ENV || 'development'}--${buildMode}-babel`
              }
            },
            {
              loader: 'ts-loader',
              options: {
                // configFile: path.resolve(__dirname, '../config/tsconfig.json')
                compilerOptions: {
                  declaration: curWebpackConfig.createDeclaration || false,
                  outDir: curEnvConfig.assetsRoot || './dist'
                },
                // TypeScript 缓存配置
                transpileOnly: true, // 只进行转译，不进行类型检查（提升性能）
                experimentalWatchApi: true // 使用实验性的 watch API（提升性能）
                // 注意：ts-loader 的缓存由 Webpack 5 的持久化缓存自动处理
              }
            }
          ],
          // exclude: /node_modules/,
          include: curProjectDir // [resolve('src')],
        },
        {
          test: /\.(jsx?)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                ...babelConfig,
                // Babel 缓存配置
                cacheDirectory: true, // 启用缓存
                cacheCompression: false, // 不压缩缓存文件以提升性能
                cacheIdentifier: `${curEnvConfig.NODE_ENV || 'development'}--${buildMode}-babel`
              }
            }
          ],
          // exclude: /node_modules/,
          include: curProjectDir // [resolve('src')],
        },
        {
          // 图片资源
          /*
            url-loader 功能类似于 file-loader，在文件大小（单位 byte）低于指定的限制时，可以返回一个 DataURL。
          */
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          type: 'asset',
          issuer: /\.s?css$/,
          parser: {
            dataUrlCondition: {
              maxSize: 2 * 1024 //data转成url的条件，也就是转成bas64的条件,maxSize相当于limit
            }
          },
          generator: {
            // filename，和output中设置assetModuleFilename一样，将资源打包至img文件夹
            filename: utils.assetsPath('img/[name].[hash:7][ext]') //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
          }
        },
        {
          test: /\.svg$/,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack']
        },
        {
          // 视频音频资源
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 2 * 1024 //data转成url的条件，也就是转成bas64的条件,maxSize相当于limit
            }
          },
          generator: {
            // filename，和output中设置assetModuleFilename一样，将资源打包至imgs文件夹
            filename: utils.assetsPath('media/[name].[hash:7][ext]') //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
          }
        },
        {
          // 字体资源
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 2 * 1024 //data转成url的条件，也就是转成bas64的条件,maxSize相当于limit
            }
          },
          generator: {
            // filename，和output中设置assetModuleFilename一样，将资源打包至fonts目录中
            filename: utils.assetsPath('fonts/[name].[hash:7][ext]') //[name]指原来的名字，[hash:6]取哈希的前六位，[ext]指原来的扩展名
          }
        },
        {
          test: /\.(js|ts|tsx|jsx|vue|css|html)$/,
          loader: 'params-replace-loader',
          // exclude: [/node_modules/, resolve('src/mock/data')], // 排除不需要进行校验的文件夹
          include: curProjectDir, // [resolve('src')],
          options: config.envParams
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader',
            options: {
              minimize: true,
              sources: false // Enables/Disables sources handling
            }
          }
        }
      ]
    },
    plugins: [
      BannerPack,
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(curEnvConfig.NODE_ENV)
      }),
      // 请确保引入这个插件来施展魔法
      new VueLoaderPlugin(),
      // new FriendlyErrorsPlugin(),
      new ProgressBarPlugin()
    ]
  };

  if (curEnvConfig.closeHotReload) {
    // 关闭热更新，则忽略所有文件变化
    webpackConfig.watchOptions.ignored = /.*/; // 忽略所有文件变化
  }

  let ignoreNodeModules = curWebpackConfig.ignoreNodeModules;
  // 优先使用执行环境中的配置
  if (curEnvConfig.ignoreNodeModules !== undefined) {
    ignoreNodeModules = curEnvConfig.ignoreNodeModules;
  }

  // allowList 需要开启 ignoreNodeModules 后有效
  let allowList = curWebpackConfig.allowList || [];
  if (curEnvConfig.allowList) {
    allowList = allowList.concat(curEnvConfig.allowList);
  }
  // 用户手动添加要剔除的依赖
  let externals = curWebpackConfig.externals || curWebpackConfig.external || {};
  if (curEnvConfig.externals && isObject(curEnvConfig.externals)) {
    externals = Object.assign(externals, curEnvConfig.externals);
  }

  // 设置要剔除的依赖
  webpackConfig.externals = ignoreNodeModules
    ? [
        nodeExternals({
          importType: 'commonjs',
          additionalModuleDirs:
            curEnvConfig.additionalModuleDirs || curWebpackConfig.additionalModuleDirs || [],
          allowlist: allowList || []
        })
      ].concat(externals)
    : externals;

  // 集成构建入口相关的配置（优先级更高）
  if (curEnvConfig.entry) {
    webpackConfig.entry = curEnvConfig.entry; // 会覆盖config.webpack.entry的配置
  }
  // 多页面多模板支持能力
  let entryConfig = webpackConfig.entry || {}; // 获取构建入口配置
  const entryFiles = Object.keys(entryConfig);

  if (
    !webpackConfig.entry ||
    JSON.stringify(webpackConfig.entry) === '{}' ||
    entryFiles.length === 0
  ) {
    // 如果当前构建入口为空，则自动从'./src/pages/'中获取入口文件
    webpackConfig.entry = getJsEntries();
  } else if (webpackConfig.entry && entryFiles.length === 1) {
    /**
     * 只有一个构建入口文件，且项目中不存在此文件，则自动从'./src/pages/'中获取构建入口文件
     */
    const filename = entryFiles[0];
    let entryFilePath = entryConfig[filename];
    // 当前entryFilePath可能是一个地址字符串，也可能是一个存储多个文件地址的数组
    if (isArray(entryFilePath)) {
      // 如果是数组则自动获取最后一个文件地址
      entryFilePath = entryFilePath[entryFilePath.length - 1];
    }
    if (!fs.existsSync(entryFilePath)) {
      // 如果仅有的构建入口文件不存在，则自动从'./src/pages/'中获取入口文件
      const curJsEntries = getJsEntries();
      webpackConfig.entry = curJsEntries ? curJsEntries : webpackConfig.entry;
    }
  }
  // 是否开启ESLint
  if (config.settings.enableESLint) {
    // ESLint 缓存目录
    const eslintCacheLocation = resolveToCurrentRoot('./node_modules/.cache/eslint');

    // ts类型
    webpackConfig.plugins.push(
      new ESLintPlugin({
        // context: resolve('src'),
        extensions: ['ts', 'tsx'],
        // include: curProjectDir, // [resolve('src')],
        // exclude: 'node_modules',
        cache: true, // 启用缓存
        cacheLocation: path.join(eslintCacheLocation, '.eslintcache-ts'), // 指定缓存位置
        cacheStrategy: 'metadata', // 使用元数据缓存策略（更快）
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        overrideConfigFile: path.resolve(__dirname, '../config/.eslintrc.ts.js')
      })
    );
    // 通用js类型
    webpackConfig.plugins.push(
      new ESLintPlugin({
        extensions: ['js', 'jsx'],
        // include: curProjectDir, // [resolve('src')],
        // exclude: 'node_modules',
        cache: true, // 启用缓存
        cacheLocation: path.join(eslintCacheLocation, '.eslintcache-js'), // 指定缓存位置
        cacheStrategy: 'metadata', // 使用元数据缓存策略（更快）
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        overrideConfigFile: path.resolve(__dirname, '../config/.eslintrc.js')
      })
    );
    // vue单文件类型
    webpackConfig.plugins.push(
      new ESLintPlugin({
        extensions: ['vue'],
        // include: curProjectDir, // [resolve('src')],
        // exclude: 'node_modules',
        cache: true, // 启用缓存
        cacheLocation: path.join(eslintCacheLocation, '.eslintcache-vue'), // 指定缓存位置
        cacheStrategy: 'metadata', // 使用元数据缓存策略（更快）
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        overrideConfigFile: path.resolve(__dirname, '../config/.eslintrc.vue.js')
      })
    );
  }
  // 是否开启StyleLint: 用于验证scss文件里面的style规范
  if (config.settings.enableStyleLint) {
    // StyleLint 缓存目录
    const stylelintCacheLocation = resolveToCurrentRoot('./node_modules/.cache/stylelint');

    const vuePagesObj = catchVuePages();
    // 判断项目中是否有vue文件
    if (vuePagesObj && Object.keys(vuePagesObj).length > 0) {
      // 校验vue单文件里面的样式规范
      webpackConfig.plugins.push(
        new StyleLintPlugin({
          files: ['src/**/*.vue'],
          // quiet: true,
          cache: true, // 启用缓存
          cacheLocation: path.join(stylelintCacheLocation, '.stylelintcache-vue'), // 统一缓存位置
          fix: config.settings.enableStyleLintFix,
          configFile: path.resolve(__dirname, '../config/.stylelintrc-vue')
        })
      );
    }
    // 校验scss等样式文件里面的样式规范
    webpackConfig.plugins.push(
      new StyleLintPlugin({
        files: 'src/**/*.s?(a|c)ss',
        // quiet: true,
        cache: true, // 启用缓存
        cacheLocation: path.join(stylelintCacheLocation, '.stylelintcache-scss'), // 统一缓存位置
        fix: config.settings.enableStyleLintFix,
        configFile: path.resolve(__dirname, '../config/.stylelintrc')
      })
    );
  }

  // 判断是否有自定义plugins
  if (curWebpackConfig.plugins && isArray(curWebpackConfig.plugins)) {
    // 添加自定义webpack插件
    webpackConfig.plugins.push(...curWebpackConfig.plugins);
  }

  // 判断是否有自定义loader
  if (curWebpackConfig.moduleRules && isArray(curWebpackConfig.moduleRules)) {
    // 添加自定义自定义loader
    webpackConfig.module.rules.push(...curWebpackConfig.moduleRules);
  }

  return webpackConfig;
};
