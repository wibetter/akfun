const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
// const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 不支持webpack4.0
// 引入当前项目配置文件
const config = require('../config/index');

exports.assetsPath = function (_path) {
  const assetsSubDirectory =
    process.NODE_ENV === 'production'
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory;
  return path.posix.join(assetsSubDirectory, _path);
};

function getAssetsPath(url) {
  // 主要用于去掉url中最后的'/'
  let newUrl = url;
  const len = url.length;
  if (url[len - 1] === '/') {
    newUrl = url.substring(0, len - 1);
  }
  return newUrl;
}

exports.cssLoaders = function (options) {
  options = options || {};

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    let loaders = [];

    // 使用MiniCssExtractPlugin提取css内容
    if (options.environment === 'prod') {
      loaders = [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: true
          }
        },
        cssLoader
      ];
    } else {
      loaders = [cssLoader];
    }

    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: { ...loaderOptions, sourceMap: options.sourceMap }
      });
    }
    return ['style-loader'].concat(loaders);
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass').concat({
      loader: 'sass-resources-loader',
      options: {
        resources: config.webpack.sassResources
      }
    }),
    less: generateLoaders('less'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
};

// Generate loaders for standalone style files (outside of .src)
exports.styleLoaders = function (options) {
  const output = [];
  const loaders = exports.cssLoaders(options);
  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader
    });
  }
  return output;
};
