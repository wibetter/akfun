const path = require('path');

const webpack = require('webpack');
const tsImportPluginFactory = require('ts-import-plugin'); // 按需加载lib库组件代码
const StyleLintPlugin = require('stylelint-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const utils = require('./loaderUtils');
const vueLoaderConfig = require('./vue-loader.conf');
const { resolve, resolveToCurrentRoot, currentPackageJson } = require('../utils/pathUtils');
const catchVuePages = require('../utils/catchVuePages'); // 用于获取当前项目中的vue单文件
// 引入当前项目配置文件
const config = require('../config/index');
const babelConfig = require('../config/babel.config'); // Babel的配置文件

const BannerPack = new webpack.BannerPlugin({
  banner: [
    `${currentPackageJson.name} v${currentPackageJson.version}`,
    `author: ${currentPackageJson.author}`,
    `build tool: AKFun`,
    `build time: ${new Date().toString()}`,
    `build info: https://github.com/wibetter/akfun`
  ].join('\n'),
  entryOnly: true // 只在入口 chunks 文件中添加
});

module.exports = () => {
  const webpackConfig = {
    entry: config.webpack.entry,
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
    resolve: config.webpack.resolve,
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
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                getCustomTransformers: () => ({
                  before: [tsImportPluginFactory(/** options */)]
                }),
                compilerOptions: {
                  module: 'es2015'
                }
              }
            }
          ],
          include: [resolve('src'), resolve('test')],
          exclude: /node_modules/
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: [
            {
              loader: 'babel-loader',
              options: babelConfig
            }
          ],
          include: [resolve('src'), resolve('test')],
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
          include: [resolve('src'), resolve('test')],
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

  // 是否开启ESLint
  if (config.settings.enableESLint) {
    // 通用js类型
    webpackConfig.module.rules.push({
      test: /\.jsx?$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [resolve('src'), resolve('public')],
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
      include: [resolve('src'), resolve('public')],
      exclude: /node_modules/,
      options: {
        cache: true,
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        configFile: path.resolve(__dirname, '../config/.eslintrc.vue.js')
      }
    });
    // ts类型
    webpackConfig.module.rules.push({
      test: /\.tsx?$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [resolve('src'), resolve('public')],
      exclude: /node_modules/,
      options: {
        cache: true,
        fix: config.settings.enableESLintFix || false,
        formatter: require('eslint-friendly-formatter'),
        configFile: path.resolve(__dirname, '../config/.eslintrc.ts.js')
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
