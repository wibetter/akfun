const deepMerge = require('deepmerge');

const deepMergeConfig = function (defaultConfig, curConfig) {
  const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
  
  return deepMerge(defaultConfig, curConfig, { arrayMerge: overwriteMerge });
};

module.exports = deepMergeConfig;
