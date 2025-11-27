const fs = require('fs');
const path = require('path');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 不支持webpack4.0
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const utils = require('./loaderUtils');
const { resolve } = require('../utils/pathUtils'); // 统一路径解析
const entrys2htmlWebpackPlugin = require('../utils/entrys2htmlWebpackPlugin');
// 引入当前项目配置文件
const projectConfig = require('../config/index');
const getBaseWebpackConfig = require('./webpack.base.conf');

/**
 * 生产环境 webpack 配置，用于构建生产环境可运行的代码（构建后的脚本会注入到 html 中）
 * @param {*} akfunConfig 当前项目配置
 * @returns
 */
module.exports = (akfunConfig) => {
  let config = akfunConfig || projectConfig; // 默认使用执行命令目录下的配置数据
  const curEnvConfig = config.build || {}; // 当前执行环境配置
  // 获取webpack基本配置
  const baseWebpackConfig = getBaseWebpackConfig(curEnvConfig, config, 'build');
  // 获取页面模板地址
  let curHtmlTemplate = path.resolve(__dirname, '../initData/template/index.html');
  if (config.webpack.template) {
    curHtmlTemplate = config.webpack.template; // akfun.config.js中的webpack配置
  }

  let curTarget = ['web', 'es5'];
  if (config.webpack.target) {
    curTarget = config.webpack.target; // akfun.config.js中的webpack配置
  }

  const webpackProdConfig = merge(baseWebpackConfig, {
    target: curTarget,
    mode: curEnvConfig.NODE_ENV, // production 模式，会启动UglifyJsPlugin服务
    /*
     内置变量列表：
     id: chunk的唯一标识，从0开始；
     name: chunk的名称；
     hash: chunk的唯一标识的Hash值；
     chunkhash: chunk内容的Hash值；
     其中hash和chunkhash的长度是可以指定的，[hash:8]代表取8位的Hash值，默认是20位。
     */
    output: {
      path: curEnvConfig.assetsRoot, // 输出文件的存放在本地的目录
      publicPath: curEnvConfig.assetsPublicPath, // 引用地址：配置发布到线上资源的URL前缀
      filename: utils.assetsPath('scripts/chunk/[name].[contenthash:8].js'),
      chunkFilename: utils.assetsPath('scripts/chunk/[name].[contenthash:8].js')
    },
    module: {
      rules: utils.styleLoaders({
        envConfig: curEnvConfig, // 当前环境变量
        sourceMap: curEnvConfig.productionSourceMap,
        environment: 'prod',
        cssLoaderUrl: config.webpack.cssLoaderUrl,
        cssLoaderUrlDir: config.webpack.cssLoaderUrlDir,
        cssLoaderOption: config.webpack.cssLoaderOption, // 用于自定义css-loader配置项（优先级最高）
        postCssLoaderOption: config.webpack.postCssLoaderOption // 用于自定义postcss-loader配置项（优先级最高）
      })
    },
    devtool: curEnvConfig.productionSourceMap ? curEnvConfig.devtool || 'source-map' : false, // 线上生成环境
    optimization: {
      chunkIds: 'deterministic', // 在不同的编译中不变的短数字 id。有益于长期缓存。在生产模式中会默认开启。
      emitOnErrors: true,
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            // 4.0: vendors
            test: /node_modules\/(.*)/,
            name: 'vendor',
            chunks: 'initial',
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -20,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      },
      // minimize: true,
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new CssMinimizerPlugin()
      ]
    },
    plugins: []
  });

  // 优先使用当前环境配置中的output
  if (curEnvConfig.output) {
    webpackProdConfig.output = deepMergeConfig(webpackProdConfig.output, curEnvConfig.output);
  }

  if (!curEnvConfig.closeHtmlWebpackPlugin) {
    // 使用用户自定义的多入口配置，生产对应的多页面多模板
    const htmlWebpackPluginList = entrys2htmlWebpackPlugin(
      webpackProdConfig.entry,
      curHtmlTemplate
    );

    htmlWebpackPluginList.forEach((htmlWebpackPlugin) => {
      webpackProdConfig.plugins.push(htmlWebpackPlugin);
    });
  }

  // 判断是否有public目录，如果有需要转移到dist目录下
  if (!curEnvConfig.ignorePublicAssets && fs.existsSync(resolve('public'))) {
    // copy custom public assets
    webpackProdConfig.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolve('public'), // 从这里拷贝
            to: curEnvConfig.assetsSubDirectory // 将根目录下的public内的资源复制到指定文件夹
          }
        ]
      })
    );
  }

  // 是否要进行压缩工作
  if (curEnvConfig.productionGzip) {
    webpackProdConfig.plugins.push(
      new CompressionWebpackPlugin({
        test: new RegExp(`\\.(${curEnvConfig.productionGzipExtensions.join('|')})$`),
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        threshold: 240,
        minRatio: 0.8
      })
    );
  }

  // 支持 cssExtract 配置
  if (curEnvConfig.cssExtract || curEnvConfig.cssExtract === undefined) {
    webpackProdConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: utils.assetsPath('css/[name].[contenthash:8].css'),
        ignoreOrder: false // Enable to remove warnings about conflicting order
      })
    );
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    /**
     * MiniCssExtractPlugin 插件可以接收以下选项（它们都是可选的）：
     * assetNameRegExp：表示应优化的资产的名称的正则表达式\最小化，默认为 /\.css$/g
     * cssProcessor：用于优化\最小化CSS的CSS处理器，默认为cssnano。
     * 这应该是cssnano.process接口之后的一个函数（接收一个CSS和options参数并返回一个Promise）。
     * cssProcessorOptions：传递给cssProcessor的选项，默认为 {}
     * canPrint：一个布尔值，指示插件是否可以将消息打印到控制台，默认为 true
     */
  }

  // 判断当前环境是否有自定义plugins
  if (curEnvConfig.plugins && Array.isArray(curEnvConfig.plugins)) {
    // 添加自定义webpack插件
    webpackProdConfig.plugins.push(...curEnvConfig.plugins);
  }

  if (curEnvConfig.bundleAnalyzerReport) {
    webpackProdConfig.plugins.push(new BundleAnalyzerPlugin());
  }

  return webpackProdConfig;
};
