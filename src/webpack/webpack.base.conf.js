const VueLoaderPlugin = require('vue-loader/lib/plugin');
const utils = require('./loaderUtils');
const vueLoaderConfig = require('./vue-loader.conf');
const { resolve } = require('../utils/pathUtils');
// 引入当前项目配置文件
const config = require('../config/index');

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
    filename: '[name].js',
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
            options: vueLoaderConfig, // 配置vue-loader相关的loader插件
          },
        ],
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        include: [resolve('src'), resolve('test')],
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
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        },
      },
      {
        // 视频音频资源
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]'),
        },
      },
      {
        // 字体资源
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.(js|ts|tsx|jsx|vue|css|html)$/,
        loader: 'params-replace-loader',
        include: [resolve('src'), resolve('test')],
        exclude: [resolve('src/mock/data')], // 排除不需要进行校验的文件夹
        options: config.envParams,
      },
    ],
  },
  plugins: [
    // 请确保引入这个插件来施展魔法
    new VueLoaderPlugin(),
  ],
};

// 是否开启ESLint
if (config.settings.enableEslint) {
  webpackConfig.module.rules.push({
    test: /\.(js|ts|tsx|jsx|vue)$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [resolve('src'), resolve('public')],
    options: {
      formatter: require('eslint-friendly-formatter'),
    },
  });
}

module.exports = webpackConfig;
