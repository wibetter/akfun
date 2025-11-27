/**
 * 配置入口文件
 * 统一加载和管理 AKFun 配置
 */
// 使用新的配置管理器
const configManager = require('../manage/ConfigManager');

// 导出合并后的配置（向后兼容）
module.exports = (akfunConfig) => {
  if (!akfunConfig) {
    // 自动加载用户配置文件
    configManager.autoLoadConfig();
  }
  // 合并配置
  const mergedConfig = configManager.mergeConfig(akfunConfig);

  // 校验当前项目配置
  configManager.validateConfig();

  return mergedConfig;
};
