# 配置管理概述

> 适用版本：v5.2.0+

AKFun v5.2.0 引入了全新的 **ConfigManager 配置管理系统**，提供更强大、更灵活的配置管理能力。

## 核心特性

- **统一配置管理** — ConfigManager 统一管理所有配置的加载、合并与访问
- **配置验证** — 自动验证配置的正确性，在构建前发现问题
- **编程式访问** — 支持在脚本中以编程方式读取和修改配置
- **向后兼容** — 完全兼容旧版配置方式，无需修改已有配置

## 对现有用户的影响

对于大多数用户，新的配置管理系统是**完全透明的**。你无需修改任何代码或配置文件，一切照常工作：

```javascript
// akfun.config.js — 和以前一样
module.exports = {
  dev: {
    port: 8080,
    autoOpenBrowser: true
  },
  build: {
    assetsRoot: './dist'
  }
}
```

```bash
# 命令行使用 — 和以前一样
akfun dev
akfun build
```

## 新增能力

如果你想利用新的配置管理功能，可以在自定义脚本中使用 ConfigManager：

```javascript
const { configManager, validateConfig } = require('akfun')

// 加载配置
configManager.loadUserConfig('./my-config.js')
const config = configManager.mergeConfig()

// 验证配置
validateConfig(config)
```

## 文档导航

- [ConfigManager API](/config-manager/api) — 完整的 API 参考
- [配置验证](/config-manager/validation) — 验证规则与错误处理
- [实践示例](/config-manager/examples) — 常见使用场景
- [调试与排查](/config-manager/debugging) — 调试技巧与常见问题
