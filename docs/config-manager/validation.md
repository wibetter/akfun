# 配置验证

AKFun 提供了配置验证功能，帮助你在构建前发现配置错误，避免因配置问题导致构建失败或运行异常。

## 基本用法

### 通过 ConfigManager 验证

```javascript
const { configManager } = require('akfun')

configManager.autoLoadConfig()
configManager.mergeConfig()

try {
  const validConfig = configManager.validateConfig()
  console.log('✓ 配置验证通过')
} catch (error) {
  console.error('✗ 配置验证失败:', error.message)
}
```

### 通过 validateConfig 函数验证

```javascript
const { validateConfig } = require('akfun')

const config = {
  dev: {
    port: 8080,
    autoOpenBrowser: true
  },
  webpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  }
}

try {
  const validConfig = validateConfig(config)
  console.log('✓ 配置验证通过')
} catch (error) {
  console.error('✗ 配置验证失败:', error.message)
}
```

## 验证规则

配置验证器会检查以下内容：

### 1. 必需字段

确保关键配置节点存在：

- `dev` — 开发配置
- `build` — 构建配置
- `webpack` — Webpack 配置

### 2. 类型检查

确保配置项的值类型正确：

| 配置项 | 期望类型 |
|--------|---------|
| `dev.port` | `number` |
| `dev.autoOpenBrowser` | `boolean` |
| `dev.https` | `boolean` |
| `build.productionSourceMap` | `boolean` |
| `build.productionGzip` | `boolean` |
| `webpack.resolve.extensions` | `string[]` |

### 3. 值范围

确保数值类型的配置在合理范围内：

| 配置项 | 有效范围 |
|--------|---------|
| `dev.port` | 1 ~ 65535 |

### 4. 路径验证

检查路径类型配置项的有效性，确保路径格式正确。

### 5. 依赖关系

检查配置项之间的依赖关系，例如：

- `webpack.allowList` 仅在 `webpack.ignoreNodeModules` 为 `true` 时有意义

## 错误示例

### 类型错误

```javascript
// ❌ 错误的配置
const badConfig = {
  dev: {
    port: 'abc',           // 应该是数字
    autoOpenBrowser: 'yes' // 应该是布尔值
  }
}

validateConfig(badConfig)
// 抛出错误：
// - dev.port 必须是数字
// - dev.autoOpenBrowser 必须是布尔值
```

### 范围错误

```javascript
// ❌ 错误的配置
const badConfig = {
  dev: {
    port: 99999  // 端口号超出范围
  }
}

validateConfig(badConfig)
// 抛出错误：
// - dev.port 必须在 1-65535 之间
```

## 最佳实践

### 在 CI/CD 中验证配置

在持续集成流程中加入配置验证步骤，确保配置变更不会导致构建问题：

```javascript
// scripts/validate-config.js
const { configManager, validateConfig } = require('akfun')

configManager.autoLoadConfig()
const config = configManager.mergeConfig()

try {
  validateConfig(config)
  console.log('✓ 配置验证通过')
  process.exit(0)
} catch (error) {
  console.error('✗ 配置验证失败:', error.message)
  process.exit(1)
}
```

```json
{
  "scripts": {
    "validate": "node scripts/validate-config.js",
    "prebuild": "npm run validate"
  }
}
```

### 开发时实时验证

在开发脚本中加入验证，及时发现配置问题：

```javascript
const { configManager } = require('akfun')

configManager.autoLoadConfig()
const config = configManager.mergeConfig()

try {
  configManager.validateConfig()
} catch (error) {
  console.warn('⚠️ 配置存在问题，但不影响开发：', error.message)
}
```
