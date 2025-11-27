/**
 * 配置管理器
 * 负责加载、合并和验证配置
 */
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const deepMergeConfig = require('../utils/deepMergeConfig');

class ConfigManager {
  constructor() {
    this.defaultConfig = require('../config/default.config');
    this.userConfig = null;
    this.mergedConfig = null;
    this.configPath = null;
  }

  /**
   * 加载用户配置文件
   * @param {string} configPath - 配置文件路径（相对于项目根目录）
   * @returns {Object|null} 用户配置对象，如果不存在则返回 null
   */
  loadUserConfig(configPath) {
    try {
      // 支持相对路径和绝对路径
      const resolvedPath = path.isAbsolute(configPath)
        ? configPath
        : path.resolve(process.cwd(), configPath);

      this.configPath = resolvedPath;

      if (!fs.existsSync(resolvedPath)) {
        console.log(chalk.yellow(`\n⚠️  未找到用户配置文件: ${configPath}\n   使用默认配置运行\n`));
        return null;
      }

      // 清除 require 缓存，确保获取最新配置
      delete require.cache[resolvedPath];
      this.userConfig = require(resolvedPath);

      console.log(chalk.green(`✓ 已加载配置文件: ${configPath}`));
      return this.userConfig;
    } catch (error) {
      console.error(chalk.red(`\n❌ 加载配置文件失败: ${configPath}\n`));
      console.error(chalk.red(`   错误信息: ${error.message}\n`));

      if (error.stack && process.env.AKFUN_DEBUG) {
        console.error(chalk.gray(error.stack));
      }

      console.log(chalk.yellow('   将使用默认配置继续运行\n'));
      return null;
    }
  }

  /**
   * 自动查找并加载配置文件
   * 按优先级查找：akfun.config.js -> akfun.config.json
   * @returns {Object|null}
   */
  autoLoadConfig(
    configFiles = ['akfun.config.js', 'akfun.config.json', '.akfunrc.js', '.akfunrc.json']
  ) {
    for (const configFile of configFiles) {
      const configPath = path.resolve(process.cwd(), configFile);
      if (fs.existsSync(configPath)) {
        return this.loadUserConfig(configPath);
      }
    }

    // 待优化：eslint 配置中如何使用外部项目的 webpack 配置
    // console.log(chalk.gray('   未找到项目配置文件，使用默认配置'));
    return null;
  }

  /**
   * 合并配置
   * @param {Object} userConfig - 用户配置（可选）
   * @returns {Object} 合并后的配置
   */
  mergeConfig(userConfig) {
    const configToMerge = userConfig || this.userConfig || {};

    try {
      this.mergedConfig = deepMergeConfig(this.defaultConfig, configToMerge);

      // 输出配置摘要
      if (process.env.AKFUN_DEBUG) {
        this.printConfigSummary();
      }

      return this.mergedConfig;
    } catch (error) {
      console.error(chalk.red('\n❌ 配置合并失败:'));
      console.error(chalk.red(`   ${error.message}\n`));
      throw error;
    }
  }

  /**
   * 获取配置
   * @param {string} key - 配置键路径（支持点号分隔，如 'webpack.resolve.alias'）
   * @returns {any} 配置值
   */
  getConfig(key) {
    if (!this.mergedConfig) {
      this.mergeConfig();
    }

    if (!key) {
      return this.mergedConfig;
    }

    // 支持点号分隔的键路径
    const keys = key.split('.');
    let result = this.mergedConfig;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return undefined;
      }
    }

    return result;
  }

  /**
   * 设置配置值（仅在内存中）
   * @param {string} key - 配置键路径
   * @param {any} value - 配置值
   */
  setConfig(key, value) {
    if (!this.mergedConfig) {
      this.mergeConfig();
    }

    const keys = key.split('.');
    let target = this.mergedConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }

    target[keys[keys.length - 1]] = value;
  }

  /**
   * 验证当前项目的配置（仅验证 userConfig 中的配置）
   * @returns {Object} 验证后的配置
   */
  validateConfig() {
    if (!this.userConfig) {
      return this.userConfig;
    }

    try {
      // 基础验证
      this._validateBasicConfig();

      // 如果有配置验证器，使用它
      try {
        const { validateConfig } = require('../utils/configValidator');
        return validateConfig(this.userConfig);
      } catch (error) {
        // 如果配置验证器不存在或出错，只进行基础验证
        if (process.env.AKFUN_DEBUG) {
          console.log(chalk.gray('   使用基础配置验证'));
        }
      }

      return this.userConfig;
    } catch (error) {
      console.error(chalk.red('\n❌ 配置验证失败:'));
      console.error(chalk.red(`   ${error.message}\n`));
      throw error;
    }
  }

  /**
   * 基础配置验证
   * @private
   */
  _validateBasicConfig() {
    const config = this.userConfig;

    // 验证必需的配置项
    if (config.dev && typeof config.dev !== 'object') {
      throw new Error('dev 配置格式错误');
    }

    if (config.build && typeof config.build !== 'object') {
      throw new Error('build 配置格式错误');
    }

    if (config.webpack && typeof config.webpack !== 'object') {
      throw new Error('webpack 配置格式错误');
    }

    // 验证端口号
    if (config.dev && config.dev.port) {
      const port = parseInt(config.dev.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('dev.port 必须是 1-65535 之间的数字');
      }
    }

    // 验证路径
    if (config.build && config.build.assetsRoot) {
      const assetsRoot = config.build.assetsRoot;
      if (typeof assetsRoot !== 'string') {
        throw new Error('build.assetsRoot 必须是字符串类型的路径');
      }
    }
  }

  /**
   * 打印配置摘要
   * @private
   */
  printConfigSummary() {
    console.log(chalk.cyan('\n📋 配置摘要:'));

    const config = this.mergedConfig;

    if (config.dev) {
      console.log(chalk.gray('   开发环境:'));
      console.log(chalk.gray(`     - 端口: ${config.dev.port}`));
      console.log(chalk.gray(`     - 自动打开浏览器: ${config.dev.autoOpenBrowser}`));
      console.log(
        chalk.gray(`     - 代理配置: ${Object.keys(config.dev.proxyTable || {}).length} 个`)
      );
    }

    if (config.build) {
      console.log(chalk.gray('   生产构建:'));
      console.log(chalk.gray(`     - 输出目录: ${config.build.assetsRoot}`));
      console.log(chalk.gray(`     - SourceMap: ${config.build.productionSourceMap}`));
      console.log(chalk.gray(`     - Gzip 压缩: ${config.build.productionGzip}`));
    }

    if (config.webpack && config.webpack.resolve) {
      console.log(chalk.gray('   Webpack 配置:'));
      console.log(chalk.gray(`     - 解析扩展名: ${config.webpack.resolve.extensions.length} 个`));
      console.log(
        chalk.gray(`     - 别名配置: ${Object.keys(config.webpack.resolve.alias || {}).length} 个`)
      );
    }

    if (config.settings) {
      console.log(chalk.gray('   代码检查:'));
      console.log(chalk.gray(`     - ESLint: ${config.settings.enableESLint}`));
      console.log(chalk.gray(`     - StyleLint: ${config.settings.enableStyleLint}`));
    }

    console.log('');
  }

  /**
   * 重置配置管理器
   */
  reset() {
    this.userConfig = null;
    this.mergedConfig = null;
    this.configPath = null;
  }

  /**
   * 获取默认配置
   * @returns {Object}
   */
  getDefaultConfig() {
    return this.defaultConfig;
  }

  /**
   * 获取用户配置
   * @returns {Object|null}
   */
  getUserConfig() {
    return this.userConfig;
  }

  /**
   * 导出配置到文件（用于调试）
   * @param {string} outputPath - 输出路径
   */
  exportConfig(outputPath) {
    if (!this.mergedConfig) {
      this.mergeConfig();
    }

    const fs = require('fs');
    const output = JSON.stringify(this.mergedConfig, null, 2);

    try {
      fs.writeFileSync(outputPath, output, 'utf-8');
      console.log(chalk.green(`✓ 配置已导出到: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ 配置导出失败: ${error.message}`));
    }
  }
}

// 导出单例实例
const configManager = new ConfigManager();

// 也导出类，方便测试
configManager.ConfigManager = ConfigManager;

module.exports = configManager;
