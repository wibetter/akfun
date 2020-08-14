const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (entryConfig, curHtmlTemplate) {
  const webpackProdConfigList = [];
  // 遍历入口配置，并生产对应的HtmlWebpackPlugin配置
  Object.keys(entryConfig).forEach(filename => {
    let curPageTemplate = curHtmlTemplate;
    // 判断是否有对应的页面模板
    const htmlPath = entryConfig[filename].replace(/\.[tj]sx?$/, '.html');
    if (fs.existsSync(htmlPath)) {
      curPageTemplate = htmlPath;
    };
    webpackProdConfigList.push(
      new HtmlWebpackPlugin({
        filename: `${filename}.html`,
        template: curPageTemplate,
        chunks: ['vendor', 'common', filename],
        inject: true, // 当传递true或body时，所有javascript资源都将放置在body元素的底部。
        minify: false, // mode: 'production'模式下会自定压缩html代码，优先级比minify高
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'auto',
      }),);
  });
  return webpackProdConfigList;
};
