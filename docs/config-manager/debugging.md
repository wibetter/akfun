# 调试与排查

本节介绍 AKFun 配置管理系统的调试技巧和常见问题的解决方案。

## 开启调试模式

通过环境变量开启调试模式，获取更详细的运行信息：

```bash
# 通过环境变量开启
AKFUN_DEBUG=true akfun dev

# 或在 npm scripts 中配置
# package.json
{
  "scripts": {
    "dev:debug": "AKFUN_DEBUG=true akfun dev"
  }
}
```

也可以在脚本中设置：

```javascript
process.env.AKFUN_DEBUG = 'true'
```

调试模式会输出以下信息：

- 配置文件的查找和加载过程
- 配置合并的详细步骤
- 当前环境变量信息
- 完整的错误堆栈信息

## 导出当前配置

将运行时的完整配置导出为 JSON 文件，方便检查配置是否符合预期：

```javascript
const { configManager } = require('akfun')

configManager.autoLoadConfig()
configManager.mergeConfig()

// 导出完整配置
configManager.exportConfig('./debug/current-config.json')

// 查看特定配置
console.log('Dev 配置:', JSON.stringify(configManager.getConfig('dev'), null, 2))
console.log('Webpack 配置:', JSON.stringify(configManager.getConfig('webpack'), null, 2))
```

## 常见问题

### 配置文件未找到

**现象：** 控制台提示 `⚠️ 未找到用户配置文件`

**可能原因：**

1. 配置文件不在项目根目录
2. 配置文件名拼写错误
3. 使用了不支持的配置文件格式

**解决方案：**

- 确认配置文件位于项目根目录（即 `package.json` 所在目录）
- 检查文件名是否为以下之一：`akfun.config.js`、`akfun.config.json`、`.akfunrc.js`、`.akfunrc.json`
- 如果配置文件在其他位置，使用绝对路径加载：

```javascript
configManager.loadUserConfig('/absolute/path/to/config.js')
```

### 配置验证失败

**现象：** 控制台提示 `❌ 配置验证失败`

**解决方案：**

1. 仔细阅读错误信息，定位具体的配置项
2. 检查配置项的值类型是否正确（参考 [配置验证](/config-manager/validation)）
3. 对照默认配置的格式进行修正
4. 导出配置进行对比：

```javascript
configManager.exportConfig('./debug/config.json')
```

### 配置合并结果不符合预期

**现象：** 某些配置项的值不是你期望的

**排查步骤：**

1. 分别查看默认配置和用户配置：

```javascript
console.log('默认配置:', configManager.getDefaultConfig())
console.log('用户配置:', configManager.getUserConfig())
console.log('合并结果:', configManager.getConfig())
```

2. 注意数组类型的配置项是**直接覆盖**而非合并：

```javascript
// 默认配置
{ extensions: ['.js', '.jsx', '.vue', '.json'] }

// 用户配置
{ extensions: ['.ts', '.tsx'] }

// 合并结果（数组直接覆盖）
{ extensions: ['.ts', '.tsx'] }  // ⚠️ 不是 ['.js', '.jsx', '.vue', '.json', '.ts', '.tsx']
```

如果需要在默认数组基础上追加，请手动包含默认值：

```javascript
module.exports = {
  webpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
    }
  }
}
```

### 端口被占用

**现象：** `akfun dev` 启动失败，提示端口已被占用

**解决方案：**

1. 修改配置中的端口号：

```javascript
module.exports = {
  dev: {
    port: 8080  // 换一个未被占用的端口
  }
}
```

2. 查找并关闭占用端口的进程：

```bash
# macOS / Linux
lsof -i :80
kill -9 <PID>

# Windows
netstat -ano | findstr :80
taskkill /PID <PID> /F
```

### 代理不生效

**现象：** 配置了 `proxyTable` 但接口请求没有被代理

**排查步骤：**

1. 确认请求路径与代理规则匹配
2. 检查目标服务器是否可访问
3. 开启调试模式查看代理日志
4. 确认 `changeOrigin` 是否设置为 `true`

```javascript
module.exports = {
  dev: {
    proxyTable: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,  // 确保设置为 true
        logLevel: 'debug'    // 开启代理调试日志
      }
    }
  }
}
```
