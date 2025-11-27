const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
// const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 不支持webpack4.0
const postCssConfig = require('../config/postcss.config'); // PostCss的配置文件

exports.assetsPath = function (_path) {
  const assetsSubDirectory = '';
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

/**
 * 用于生成css-loader配置
 * @param {*} options
 * @param {Object} options.envConfig 当前环境配置
 * @param {Object} options.webpackConfig 当前webpack配置
 * @returns {Object} css-loader配置
 * webpackConfig.cssLoaderUrl, // 用于自定义css-loader配置项[url]
 * webpackConfig.cssLoaderUrlDir, // 用于设置css-loader配置项[url]的生效目录
 * webpackConfig.cssLoaderOption, // 用于自定义css-loader配置项（优先级最高）
 * webpackConfig.sassOptions, // 用于设置sass-loader配置项
 * webpackConfig.productionSourceMap, // 生产环境sourceMap是true
 * webpackConfig.NODE_ENV // 生产环境下：将相关的样式内容提取出来合并到一个文件中
 * @returns {Object} css-loader 配置
 */
exports.cssLoaders = function (options) {
  options = options || {};
  const curEnvConfig = options.envConfig || {};
  const curWebpackConfig = options.webpackConfig || {};

  const VueCssLoader = {
    loader: 'vue-style-loader',
    options: {
      sourceMap: curEnvConfig.productionSourceMap
    }
  };

  const cssLoader = {
    loader: 'css-loader',
    options: {
      // url: false, // enables/disables url()/image-set() functions handling
      url: {
        filter: (url, resourcePath) => {
          if (
            curWebpackConfig.cssLoaderUrlDir &&
            resourcePath.includes(curWebpackConfig.cssLoaderUrlDir)
          ) {
            // 指定处理某类路径下的中相关 css 文件中的 url
            return true;
          }
          if (url.startsWith('data:')) {
            // 不处理 css 中的 bas64 url
            return false;
          } else if (curWebpackConfig.cssLoaderUrl !== undefined) {
            // cssLoaderUrl 为false 则不处理 css 中的 url
            return curWebpackConfig.cssLoaderUrl;
          }
          return true;
        }
      },
      sourceMap: curEnvConfig.productionSourceMap,
      ...(curWebpackConfig.cssLoaderOption || {})
    }
  };

  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      ...postCssConfig,
      ...(curWebpackConfig.postCssLoaderOption || {})
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    let loaders = [];
    // 生产环境使用MiniCssExtractPlugin提取css内容，用于提取css内容到一个独立的文件中
    if (curEnvConfig.NODE_ENV === 'production') {
      const cssExtract = curEnvConfig.cssExtract || curEnvConfig.cssExtract === undefined;
      // MiniCssExtractPlugin.loader 需要配合 MiniCssExtractPlugin 使用
      loaders = [
        VueCssLoader,
        cssExtract
          ? {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: false // enable a CommonJS syntax using
              }
            }
          : undefined,
        cssLoader,
        postCssLoader
      ];
    } else {
      loaders = [VueCssLoader, cssLoader, postCssLoader];
    }

    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: { ...loaderOptions, sourceMap: curEnvConfig.productionSourceMap }
      });
    }

    // 如果是sass、scss文件，则增加sass-resources-loader
    if (
      (loader === 'sass' || loader === 'scss') &&
      curWebpackConfig.sassResources &&
      curWebpackConfig.sassResources.length > 0
    ) {
      loaders.push({
        loader: 'sass-resources-loader',
        options: {
          resources: curWebpackConfig.sassResources || []
        }
      });
    }

    return loaders;
  }

  const sassOptions = curWebpackConfig.sassOptions || {};

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    sass: generateLoaders('sass', { indentedSyntax: true, sassOptions }),
    scss: generateLoaders('sass', { sassOptions }),
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
