const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 替换extract-text-webpack-plugin
// const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 不支持webpack4.0
// 引入当前项目配置文件
const config = require('../config/index');
const postCssConfig = require('../config/postcss.config'); // PostCss的配置文件

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

  const VueCssLoader = {
    loader: 'vue-style-loader',
    options: {
      sourceMap: options.sourceMap
    }
  };

  const cssLoader = {
    loader: 'css-loader',
    options: {
      // url: false, // enables/disables url()/image-set() functions handling
      url: {
        filter: (url, resourcePath) => {
          if (url.startsWith('data:')) {
            // 不处理 css 中的 bas64 url
            return false;
          } else if (options.cssLoaderUrlDir && resourcePath.includes(options.cssLoaderUrlDir)) {
            // 指定处理某类路径下的中相关 css 文件中的 url
            return true;
          } else if (options.cssLoaderUrl !== undefined) {
            // cssLoaderUrl 为true 则不处理 css 中的 url
            return options.cssLoaderUrl;
          } else if (resourcePath.includes('node_modules')) {
            // 默认不处理 node_modules 中相关 css 文件中的 url
            return false;
          }
          return true;
        }
      },
      sourceMap: options.sourceMap
    }
  };

  const postCssLoader = {
    loader: 'postcss-loader',
    options: postCssConfig // 同babel-loader的option
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    let loaders = [];
    // 生产环境使用MiniCssExtractPlugin提取css内容，用于提取css内容到一个独立的文件中
    if (options.environment === 'prod') {
      // MiniCssExtractPlugin.loader需要配合MiniCssExtractPlugin使用
      loaders = [
        VueCssLoader,
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: false // enable a CommonJS syntax using
          }
        },
        cssLoader,
        postCssLoader
      ];
    } else {
      loaders = [VueCssLoader, cssLoader, postCssLoader];
    }

    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: { ...loaderOptions, sourceMap: options.sourceMap }
      });
    }

    // 如果是sass、scss文件，则增加sass-resources-loader
    if (
      (loader === 'sass' || loader === 'scss') &&
      config.webpack.sassResources &&
      config.webpack.sassResources.length > 0
    ) {
      loaders.push({
        loader: 'sass-resources-loader',
        options: {
          resources: config.webpack.sassResources || []
        }
      });
    }

    return loaders;
  }

  const sassOptions = options.sassOptions || {};

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
