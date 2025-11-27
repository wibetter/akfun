/**
 * 配置验证器
 * 提供配置项的验证功能
 */
const chalk = require('chalk');
const path = require('path');

class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 验证配置对象
   * @param {Object} config - 配置对象
   * @returns {Object} 验证后的配置
   */
  validate(config) {
    this.errors = [];
    this.warnings = [];

    if (!config || typeof config !== 'object') {
      throw new Error('配置必须是一个对象');
    }

    // 验证各个部分
    this._validateSettings(config.settings);
    this._validateWebpack(config.webpack);
    this._validateDev(config.dev);
    this._validateBuild(config.build);
    this._validateBuild2Lib(config.build2lib);
    this._validateBuild2Esm(config.build2esm);
    this._validateEnvParams(config.envParams);

    // 输出警告
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  配置警告:'));
      this.warnings.forEach((warning) => {
        console.log(chalk.yellow(`   - ${warning}`));
      });
      console.log('');
    }

    // 如果有错误，抛出异常
    if (this.errors.length > 0) {
      console.error(chalk.red('\n❌ 配置验证失败:'));
      this.errors.forEach((error) => {
        console.error(chalk.red(`   - ${error}`));
      });
      console.log('');
      throw new Error('配置验证失败，请检查以上错误信息');
    }

    return config;
  }

  /**
   * 验证 settings 配置
   * @private
   */
  _validateSettings(settings) {
    if (!settings) return;

    const booleanFields = [
      'enableESLint',
      'enableESLintFix',
      'enableStyleLint',
      'enableStyleLintFix'
    ];

    booleanFields.forEach((field) => {
      if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
        this.errors.push(`settings.${field} 必须是布尔值`);
      }
    });
  }

  /**
   * 验证 webpack 配置
   * @private
   */
  _validateWebpack(webpack) {
    if (!webpack) {
      this.errors.push('webpack 配置缺失');
      return;
    }

    // 验证 entry
    if (webpack.entry !== undefined) {
      this._validateEntry(webpack.entry);
    }

    // 验证 resolve
    if (webpack.resolve) {
      this._validateResolve(webpack.resolve);
    }

    // 验证 externals
    if (webpack.externals !== undefined) {
      const validTypes = ['object', 'string', 'function'];
      if (!validTypes.includes(typeof webpack.externals)) {
        this.errors.push('webpack.externals 类型不正确');
      }
    }

    // 验证 sassResources
    if (webpack.sassResources !== undefined) {
      if (!Array.isArray(webpack.sassResources)) {
        this.errors.push('webpack.sassResources 必须是数组');
      }
    }

    // 验证 babelPlugins
    if (webpack.babelPlugins !== undefined) {
      const validTypes = ['function', 'object'];
      const type = Array.isArray(webpack.babelPlugins) ? 'object' : typeof webpack.babelPlugins;
      if (!validTypes.includes(type)) {
        this.errors.push('webpack.babelPlugins 必须是数组或函数');
      }
    }

    // 验证 moduleRules
    if (webpack.moduleRules !== undefined && !Array.isArray(webpack.moduleRules)) {
      this.errors.push('webpack.moduleRules 必须是数组');
    }

    // 验证 plugins
    if (webpack.plugins !== undefined && !Array.isArray(webpack.plugins)) {
      this.errors.push('webpack.plugins 必须是数组');
    }
  }

  /**
   * 验证 entry 配置
   * @private
   */
  _validateEntry(entry) {
    if (entry === undefined || entry === null) {
      return;
    }

    const type = typeof entry;

    if (type === 'string') {
      // 单个入口文件
      return;
    }

    if (Array.isArray(entry)) {
      // 数组形式的入口
      entry.forEach((item, index) => {
        if (typeof item !== 'string') {
          this.errors.push(`entry[${index}] 必须是字符串`);
        }
      });
      return;
    }

    if (type === 'object') {
      // 对象形式的入口
      Object.keys(entry).forEach((key) => {
        const value = entry[key];
        if (typeof value !== 'string' && !Array.isArray(value)) {
          this.errors.push(`entry.${key} 必须是字符串或数组`);
        }
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item !== 'string') {
              this.errors.push(`entry.${key}[${index}] 必须是字符串`);
            }
          });
        }
      });
      return;
    }

    this.errors.push('entry 配置格式不正确');
  }

  /**
   * 验证 resolve 配置
   * @private
   */
  _validateResolve(resolve) {
    if (resolve.extensions !== undefined) {
      if (!Array.isArray(resolve.extensions)) {
        this.errors.push('webpack.resolve.extensions 必须是数组');
      } else {
        resolve.extensions.forEach((ext, index) => {
          if (typeof ext !== 'string') {
            this.errors.push(`webpack.resolve.extensions[${index}] 必须是字符串`);
          } else if (!ext.startsWith('.')) {
            this.warnings.push(`webpack.resolve.extensions[${index}] (${ext}) 建议以 "." 开头`);
          }
        });
      }
    }

    if (resolve.alias !== undefined && typeof resolve.alias !== 'object') {
      this.errors.push('webpack.resolve.alias 必须是对象');
    }
  }

  /**
   * 验证 dev 配置
   * @private
   */
  _validateDev(dev) {
    if (!dev) {
      this.errors.push('dev 配置缺失');
      return;
    }

    // 验证 NODE_ENV
    if (dev.NODE_ENV && typeof dev.NODE_ENV !== 'string') {
      this.errors.push('dev.NODE_ENV 必须是字符串');
    }

    // 验证端口
    if (dev.port !== undefined) {
      this._validatePort(dev.port, 'dev.port');
    }

    // 验证布尔值字段
    const booleanFields = ['autoOpenBrowser', 'cssSourceMap', 'https', 'closeHotReload'];
    booleanFields.forEach((field) => {
      if (dev[field] !== undefined && typeof dev[field] !== 'boolean') {
        this.errors.push(`dev.${field} 必须是布尔值`);
      }
    });

    // 验证字符串字段
    const stringFields = ['assetsPublicPath', 'assetsSubDirectory', 'hostname'];
    stringFields.forEach((field) => {
      if (dev[field] !== undefined && typeof dev[field] !== 'string') {
        this.errors.push(`dev.${field} 必须是字符串`);
      }
    });

    // 验证 proxyTable
    if (dev.proxyTable !== undefined && typeof dev.proxyTable !== 'object') {
      this.errors.push('dev.proxyTable 必须是对象');
    }
  }

  /**
   * 验证 build 配置
   * @private
   */
  _validateBuild(build) {
    if (!build) {
      this.errors.push('build 配置缺失');
      return;
    }

    this._validateBuildCommon(build, 'build');
  }

  /**
   * 验证 build2lib 配置
   * @private
   */
  _validateBuild2Lib(build2lib) {
    if (!build2lib) return;

    this._validateBuildCommon(build2lib, 'build2lib');

    // 验证 libraryName
    if (build2lib.libraryName !== undefined && typeof build2lib.libraryName !== 'string') {
      this.errors.push('build2lib.libraryName 必须是字符串');
    }
  }

  /**
   * 验证 build2esm 配置
   * @private
   */
  _validateBuild2Esm(build2esm) {
    if (!build2esm) return;

    // 验证 input
    if (build2esm.input !== undefined && typeof build2esm.input !== 'string') {
      this.errors.push('build2esm.input 必须是字符串');
    }

    // 验证 fileName
    if (build2esm.fileName !== undefined && typeof build2esm.fileName !== 'string') {
      this.errors.push('build2esm.fileName 必须是字符串');
    }

    // 验证 type
    if (build2esm.type !== undefined) {
      const validTypes = ['ts', 'js'];
      if (!validTypes.includes(build2esm.type)) {
        this.errors.push(`build2esm.type 必须是 ${validTypes.join(' 或 ')}`);
      }
    }

    // 验证 compress
    if (build2esm.compress !== undefined && typeof build2esm.compress !== 'boolean') {
      this.errors.push('build2esm.compress 必须是布尔值');
    }

    // 验证 declaration
    if (build2esm.declaration !== undefined && typeof build2esm.declaration !== 'boolean') {
      this.errors.push('build2esm.declaration 必须是布尔值');
    }

    // 验证 excludeList
    if (build2esm.excludeList !== undefined && !Array.isArray(build2esm.excludeList)) {
      this.errors.push('build2esm.excludeList 必须是数组');
    }
  }

  /**
   * 验证通用的 build 配置项
   * @private
   */
  _validateBuildCommon(buildConfig, prefix) {
    // 验证 NODE_ENV
    if (buildConfig.NODE_ENV && typeof buildConfig.NODE_ENV !== 'string') {
      this.errors.push(`${prefix}.NODE_ENV 必须是字符串`);
    }

    // 验证路径字段
    const pathFields = ['assetsRoot', 'assetsPublicPath', 'assetsSubDirectory'];
    pathFields.forEach((field) => {
      if (buildConfig[field] !== undefined && typeof buildConfig[field] !== 'string') {
        this.errors.push(`${prefix}.${field} 必须是字符串`);
      }
    });

    // 验证布尔值字段
    const booleanFields = ['productionSourceMap', 'productionGzip', 'bundleAnalyzerReport'];
    booleanFields.forEach((field) => {
      if (buildConfig[field] !== undefined && typeof buildConfig[field] !== 'boolean') {
        this.errors.push(`${prefix}.${field} 必须是布尔值`);
      }
    });

    // 验证 productionGzipExtensions
    if (buildConfig.productionGzipExtensions !== undefined) {
      if (!Array.isArray(buildConfig.productionGzipExtensions)) {
        this.errors.push(`${prefix}.productionGzipExtensions 必须是数组`);
      }
    }
  }

  /**
   * 验证 envParams 配置
   * @private
   */
  _validateEnvParams(envParams) {
    if (!envParams) return;

    if (typeof envParams !== 'object') {
      this.errors.push('envParams 必须是对象');
      return;
    }

    // 验证每个环境的参数
    Object.keys(envParams).forEach((env) => {
      if (typeof envParams[env] !== 'object') {
        this.errors.push(`envParams.${env} 必须是对象`);
      }
    });
  }

  /**
   * 验证端口号
   * @private
   */
  _validatePort(port, fieldName) {
    const portNum = parseInt(port, 10);

    if (isNaN(portNum)) {
      this.errors.push(`${fieldName} 必须是数字`);
      return;
    }

    if (portNum < 1 || portNum > 65535) {
      this.errors.push(`${fieldName} 必须在 1-65535 之间`);
      return;
    }

    if (portNum < 1024 && process.platform !== 'win32') {
      this.warnings.push(
        `${fieldName} (${portNum}) 小于 1024，在非 Windows 系统上可能需要管理员权限`
      );
    }
  }

  /**
   * 获取错误列表
   * @returns {Array}
   */
  getErrors() {
    return this.errors;
  }

  /**
   * 获取警告列表
   * @returns {Array}
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * 是否有错误
   * @returns {boolean}
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * 是否有警告
   * @returns {boolean}
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }
}

/**
 * 验证配置（便捷方法）
 * @param {Object} config - 配置对象
 * @returns {Object} 验证后的配置
 */
function validateConfig(config) {
  const validator = new ConfigValidator();
  return validator.validate(config);
}

module.exports = {
  ConfigValidator,
  validateConfig
};
