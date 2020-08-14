const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 不支持webpack4.0
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const utils = require('./loaderUtils');
const { resolve } = require('../utils/pathUtils'); // 统一路径解析
// 引入当前项目配置文件
const config = require('../config/index');
const baseWebpackConfig = require('./webpack.base.conf');

const webpackProdConfig = merge(baseWebpackConfig, {
  mode: config.build2lib.NODE_ENV, // production 模式，会启动UglifyJsPlugin服务
  output: {
    path: config.build.assetsRoot, // 输出文件的存放在本地的目录
    publicPath: config.build.assetsPublicPath, // 引用地址：配置发布到线上资源的URL前缀
    filename: utils.assetsPath('scripts/chunk/[name].[contenthash:8].js'),
    chunkFilename: utils.assetsPath('scripts/chunk/[name].[contenthash:8].js'),
  },
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      environment: 'prod',
    }),
  },
  // devtool: '#cheap-module-eval-source-map', // 本地开发环境中的取值
  devtool: config.build.productionSourceMap ? '#source-map' : false, // 线上开发环境中的取值
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /node_modules\/(.*)/,
          name: 'vendor',
          chunks: 'initial',
          reuseExistingChunk: true,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    require('autoprefixer'),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(config.build.NODE_ENV), // vue-router中根据此变量判断执行环境
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: utils.assetsPath('css/[name].[contenthash:8].css'),
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    /**
     * 该插件可以接收以下选项（它们都是可选的）：
     * assetNameRegExp：表示应优化的资产的名称的正则表达式\最小化，默认为 /\.css$/g
     * cssProcessor：用于优化\最小化CSS的CSS处理器，默认为cssnano。
     * 这应该是cssnano.process接口之后的一个函数（接收一个CSS和options参数并返回一个Promise）。
     * cssProcessorOptions：传递给cssProcessor的选项，默认为 {}
     * canPrint：一个布尔值，指示插件是否可以将消息打印到控制台，默认为 true
     */
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true,
      },
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: config.webpack.template,
      inject: true, // 当传递true或body时，所有javascript资源都将放置在body元素的底部。
      minify: false, // mode: 'production'模式下会自定压缩html代码，优先级比minify高
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'auto',
    }),
    // copy custom public assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve('public'), // 从这里拷贝
          to: config.build.assetsSubDirectory, // 将根目录下的public内的资源复制到指定文件夹
        },
      ],
    }),
    new FriendlyErrorsPlugin(),
    new ProgressBarPlugin(),
  ],
});

// 是否要进行压缩工作
if (config.build.productionGzip) {
  webpackProdConfig.plugins.push(
    new CompressionWebpackPlugin({
      test: new RegExp(
        `\\.(${config.build.productionGzipExtensions.join('|')})$`,
      ),
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      threshold: 240,
      minRatio: 0.8,
    }),
  );
}

if (config.build.bundleAnalyzerReport) {
  webpackProdConfig.plugins.push(new BundleAnalyzerPlugin());
}

// 集成构建入口相关的配置
if (config.build.entry) {
  webpackProdConfig.entry = config.build.entry; // 会覆盖config.webpack.entry的配置
}

module.exports = webpackProdConfig;
