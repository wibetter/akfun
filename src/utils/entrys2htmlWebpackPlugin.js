const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { isArray } = require('../utils/typeof');

module.exports = function (entryConfig, curDefaultHtmlTemplate) {
  const webpackProdConfigList = [];
  if (entryConfig) {
    // 遍历入口配置，并生产对应的HtmlWebpackPlugin配置
    Object.keys(entryConfig).forEach((filename) => {
      let curPageTemplate = curDefaultHtmlTemplate;
      // 判断是否有对应的页面模板
      let filePath = entryConfig[filename];
      if (isArray(filePath)) {
        // 当前构建入口包含多个文件
        filePath = filePath[filePath.length - 1]; // 以最后一个文件对应的html为页面模板
      }
      if (filePath) {
        const htmlPath = filePath.replace(/\.[tj]sx?$/, '.html');
        if (fs.existsSync(htmlPath)) {
          curPageTemplate = htmlPath;
        }
        webpackProdConfigList.push(
          new HtmlWebpackPlugin({
            filename: `${filename}.html`,
            template: curPageTemplate,
            chunks: ['vendor', 'common', filename],
            inject: 'body', // 当传递true或body时，所有javascript资源都将放置在body元素的底部。
            minify: false, // mode: 'production'模式下会自定压缩html代码，优先级比minify高
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'auto'
          })
        );
      }
    });
  }
  return webpackProdConfigList;
};
