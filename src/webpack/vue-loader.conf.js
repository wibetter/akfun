const utils = require('./loaderUtils');

module.exports = (curEnvConfig, curWebpackConfig) => {
  return {
    loaders: utils.cssLoaders({
      envConfig: curEnvConfig, // 当前环境变量
      webpackConfig: curWebpackConfig // 当前webpack配置
    }),
    transformToRequire: {
      video: 'src',
      source: 'src',
      img: 'src',
      image: 'xlink:href'
    }
  };
};
