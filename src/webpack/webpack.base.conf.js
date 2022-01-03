const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
// const tsImportPluginFactory = require('ts-import-plugin'); // 按需加载lib库组件代码
const StyleLintPlugin = require('stylelint-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const nodeExternals = require('webpack-node-externals');
const utils = require('./loaderUtils');
const vueLoaderConfig = require('./vue-loader.conf');
const { resolve, resolveToCurrentRoot } = require('../utils/pathUtils');
const getProjectDir = require('../utils/getProjectDir');
const catchVuePages = require('../utils/catchVuePages'); // 用于获取当前项目中的vue单文件
// 引入当前项目配置文件
const projectConfig = require('../config/index');
const babelConfig = require('../config/babel.config'); // Babel的配置文件
const {buildBanner} = require("../utils/akfunParams");
const getJsEntries = require('../utils/jsEntries');
const { isArray } = require('../utils/typeof');

// 生成构建头部信息
const BannerPack = new webpack.BannerPlugin({
  banner: buildBanner,
  entryOnly: true // 只在入口 chunks 文件中添加
});

/**
 * webpack.base.conf.js
 * 主要用于设置 rules 和 通用插件
 * _curEnvConfig: 执行环境中的配置，比如：dev、build、build2lib等；
 * _akfunConfig：完整的配置对象
 */
module.exports = (_curEnvConfig, _akfunConfig) => {
  const curEnvConfig = _curEnvConfig || {}; // 用于接收当前运行环境配置变量
  let config = _akfunConfig || projectConfig; // 默认使用执行命令目录下的配置数据
  const curWebpackConfig = config.webpack;
  // 获取当前项目目录
  const curProjectDir = getProjectDir(curWebpackConfig.projectDir);
  const webpackConfig = {
    entry: curWebpackConfig.entry,
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
    /**
     * 当webpack试图去加载模块的时候，它默认是查找以 .js 结尾的文件的
     */
    resolve: curWebpackConfig.resolve,
    externals: curWebpackConfig.ignoreNodeModules
      ? [nodeExternals({
        allowlist: curWebpackConfig.allowList ? curWebpackConfig.allowList : []
      })].concat(curWebpackConfig.externals)
      : curWebpackConfig.externals,
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: vueLoaderConfig // 配置vue-loader相关的loader插件
            }
          ]
        },
        // 关于ts的检测：https://ts.xcatliu.com/engineering/lint.html
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: babelConfig
            },
            {
              loader: 'ts-loader',
              options: {
                // configFile: path.resolve(__dirname, '../config/tsconfig.json')
                compilerOptions: {
                  declaration: curWebpackConfig.createDeclaration || false,
                  outDir: curEnvConfig.assetsRoot || './dist'
                }
              }
            }
          ],
          include: curProjectDir, // [resolve('src')],
          exclude: /node_modules/
        },
        {
          test: /\.(jsx?)$/,
          use: [
            {
              loader: 'babel-loader',
              options: babelConfig
            }
          ],
          include: curProjectDir, // [resolve('src')],
          exclude: /node_modules/
        },
        {
          // 图片资源
          /*
            url-loader 功能类似于 file-loader，在文件大小（单位 byte）低于指定的限制时，可以返回一个 DataURL。
           */
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]')
          }
        },
        {
          // 视频音频资源
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('media/[name].[hash:7].[ext]')
          }
        },
        {
          // 字体资源
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader'
          }
        },
        {
          test: /\.(js|ts|tsx|jsx|vue|css|html)$/,
          loader: 'params-replace-loader',
          include: curProjectDir, // [resolve('src')],
          exclude: [/node_modules/, resolve('src/mock/data')], // 排除不需要进行校验的文件夹
          options: config.envParams
        }
      ]
    },
    plugins: [
      BannerPack,
      // 请确保引入这个插件来施展魔法
      new VueLoaderPlugin()
    ]
  };
  // 优先使用执行环境中的配置
  if (curEnvConfig.ignoreNodeModules !== undefined) {
    const allowList = curEnvConfig.allowList || curWebpackConfig.allowList;
    const externals = curEnvConfig.externals || config.webpack.external || [];
    webpackConfig.externals = curEnvConfig.ignoreNodeModules ? [nodeExternals({
      allowlist: allowList || [],
    })].concat(externals) : externals;
  }
  // 集成构建入口相关的配置（优先级更高）
  if (curEnvConfig.entry) {
    webpackConfig.entry = curEnvConfig.entry; // 会覆盖config.webpack.entry的配置
  }
  // 多页面多模板支持能力
  let entryConfig = webpackConfig.entry || {}; // 获取构建入口配置
  const entryFiles = (entryConfig && Object.keys(entryConfig)) || [];

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
    // ts类型
    webpackConfig.module.rules.push({
      test: /\.tsx?$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: curProjectDir, // [resolve('src')],
      exclude: /node_modules/,
      options: {
        cache: true,
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        configFile: path.resolve(__dirname, '../config/.eslintrc.ts.js')
      }
    });
    // 通用js类型
    webpackConfig.module.rules.push({
      test: /\.jsx?$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: curProjectDir, // [resolve('src')],
      exclude: /node_modules/,
      options: {
        cache: true, // the cache is written to the ./node_modules/.cache/eslint-loader director
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        configFile: path.resolve(__dirname, '../config/.eslintrc.js')
      }
    });
    // vue单文件类型
    webpackConfig.module.rules.push({
      test: /\.vue$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: curProjectDir, // [resolve('src')],
      exclude: /node_modules/,
      options: {
        cache: true,
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        configFile: path.resolve(__dirname, '../config/.eslintrc.vue.js')
      }
    });
  }
  // 是否开启StyleLint: 用于验证scss文件里面的style规范
  if (config.settings.enableStyleLint) {
    const vuePagesObj = catchVuePages();
    // 判断项目中是否有vue文件
    if (vuePagesObj && Object.keys(vuePagesObj).length > 0) {
      // 校验vue单文件里面的样式规范
      webpackConfig.plugins.push(
        new StyleLintPlugin({
          files: ['src/**/*.vue'],
          quiet: true,
          cache: true,
          cacheLocation: resolveToCurrentRoot('./node_modules/stylelint/.vue-cache'),
          fix: config.settings.enableStyleLintFix,
          configFile: path.resolve(__dirname, '../config/.stylelintrc-vue')
        })
      );
    }
    // 校验scss等样式文件里面的样式规范
    webpackConfig.plugins.push(
      new StyleLintPlugin({
        files: 'src/**/*.s?(a|c)ss',
        quiet: true,
        cache: true,
        cacheLocation: resolveToCurrentRoot('./node_modules/stylelint/.cache'),
        fix: config.settings.enableStyleLintFix,
        configFile: path.resolve(__dirname, '../config/.stylelintrc')
      })
    );
  }

  return webpackConfig;
};
