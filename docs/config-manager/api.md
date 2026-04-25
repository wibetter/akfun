# ConfigManager API

ConfigManager 是 AKFun 配置管理系统的核心类，提供配置的加载、合并、访问、修改和验证等能力。

## 引入方式

```javascript
const { configManager } = require('akfun')
```

## 配置加载

### loadUserConfig(configPath)

加载指定路径的用户配置文件。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `configPath` | `string` | 配置文件路径（支持相对路径和绝对路径） |

**返回值：** `Object | null` — 用户配置对象，加载失败时返回 `null`

```javascript
// 加载相对路径的配置文件
configManager.loadUserConfig('./akfun.config.js')

// 加载绝对路径的配置文件
configManager.loadUserConfig('/path/to/config.js')
```

### autoLoadConfig()

自动查找并加载配置文件，按以下优先级依次查找：

1. `akfun.config.js`
2. `akfun.config.json`
3. `.akfunrc.js`
4. `.akfunrc.json`

**返回值：** `Object | null` — 找到的配置对象，未找到时返回 `null`

```javascript
configManager.autoLoadConfig()
```

## 配置合并

### mergeConfig(userConfig?)

将用户配置与默认配置进行深度合并。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userConfig` | `Object` | 否 | 用户配置对象。省略时使用已加载的配置 |

**返回值：** `Object` — 合并后的完整配置对象

```javascript
// 使用已加载的配置合并
const config = configManager.mergeConfig()

// 传入自定义配置合并
const config = configManager.mergeConfig({
  dev: { port: 9000 }
})
```

::: tip 合并规则
- 对象类型的配置项会进行深度合并
- 数组类型的配置项会直接覆盖（不会合并数组元素）
- 基本类型的配置项会直接覆盖
:::

## 配置访问

### getConfig(key?)

获取配置值，支持点号分隔的键路径。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | `string` | 否 | 配置键路径，如 `'webpack.resolve.alias'`。省略时返回完整配置 |

**返回值：** `any` — 配置值，不存在时返回 `undefined`

```javascript
// 获取完整配置
const allConfig = configManager.getConfig()

// 获取顶层配置
const devConfig = configManager.getConfig('dev')

// 获取嵌套配置
const aliases = configManager.getConfig('webpack.resolve.alias')
const port = configManager.getConfig('dev.port')
```

### getDefaultConfig()

获取 AKFun 的默认配置对象。

**返回值：** `Object` — 默认配置

```javascript
const defaults = configManager.getDefaultConfig()
console.log(defaults.dev.port) // 80
```

### getUserConfig()

获取用户配置对象（未与默认配置合并的原始配置）。

**返回值：** `Object | null` — 用户配置，未加载时返回 `null`

```javascript
const userConfig = configManager.getUserConfig()
```

## 配置修改

### setConfig(key, value)

在内存中设置配置值。修改仅在当前运行时生效，不会写入配置文件。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 配置键路径 |
| `value` | `any` | 配置值 |

```javascript
// 设置简单值
configManager.setConfig('dev.port', 9000)

// 设置对象值
configManager.setConfig('webpack.resolve.alias', {
  '@': './src',
  '@components': './src/components'
})

// 设置嵌套值
configManager.setConfig('dev.proxyTable./api', {
  target: 'http://api.example.com',
  changeOrigin: true
})
```

## 验证与工具

### validateConfig()

验证当前配置的正确性。

**返回值：** `Object` — 验证通过后的配置对象

**异常：** 配置验证失败时抛出包含详细错误信息的异常

```javascript
try {
  const validConfig = configManager.validateConfig()
  console.log('配置验证通过')
} catch (error) {
  console.error('配置验证失败:', error.message)
}
```

详细的验证规则请参考 [配置验证](/config-manager/validation)。

### exportConfig(outputPath)

将当前配置导出为 JSON 文件，主要用于调试。

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `outputPath` | `string` | 输出文件路径 |

```javascript
configManager.exportConfig('./debug-config.json')
```

### reset()

重置配置管理器的状态，清除已加载的用户配置和合并后的配置。

```javascript
configManager.reset()
```

::: tip 使用场景
在需要连续处理多个项目配置时（如批量构建），每次处理前调用 `reset()` 确保配置状态干净。
:::
