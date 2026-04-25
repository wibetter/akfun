# 开发配置

本节介绍 `akfun dev` 命令相关的开发服务器配置，包括端口、代理、HTTPS 等。

## 完整配置示例

```javascript
module.exports = {
  dev: {
    NODE_ENV: 'development',
    port: 80,
    autoOpenBrowser: true,
    assetsPublicPath: '/',
    assetsSubDirectory: '',
    hostname: 'localhost',
    cssSourceMap: false,
    https: false,
    proxyTable: {}
  }
}
```

## 配置项详解

### 基本设置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | `string` | `'development'` | 环境模式，`development` 模式下不会启用代码压缩 |
| `port` | `number` | `80` | 开发服务器监听的端口号 |
| `autoOpenBrowser` | `boolean` | `true` | 启动后是否自动在浏览器中打开项目页面 |
| `hostname` | `string` | `'localhost'` | 自动打开页面时使用的主机名 |
| `cssSourceMap` | `boolean` | `false` | 是否生成 CSS Source Map |

### 静态资源路径

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `assetsPublicPath` | `string` | `'/'` | 静态资源的引用根路径 |
| `assetsSubDirectory` | `string` | `''` | 静态资源的二级路径 |

## 接口代理

通过 `proxyTable` 配置接口代理，解决本地开发时的跨域问题。底层使用 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)。

### 基本用法

```javascript
module.exports = {
  dev: {
    proxyTable: {
      '/api': {
        target: 'http://api.example.com',  // 目标服务器地址
        changeOrigin: true                  // 修改请求头中的 Origin
      }
    }
  }
}
```

配置后，所有以 `/api` 开头的请求都会被代理到 `http://api.example.com`：

```
本地请求：http://localhost/api/users
实际请求：http://api.example.com/api/users
```

### 路径重写

如果后端接口没有 `/api` 前缀，可以通过 `pathRewrite` 去掉：

```javascript
module.exports = {
  dev: {
    proxyTable: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''  // 将 /api 前缀替换为空
        }
      }
    }
  }
}
```

```
本地请求：http://localhost/api/users
实际请求：http://api.example.com/users
```

### WebSocket 代理

如果需要代理 WebSocket 连接，设置 `ws: true`：

```javascript
module.exports = {
  dev: {
    proxyTable: {
      '/ws': {
        target: 'http://api.example.com',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
```

### 多个代理

可以同时配置多个代理规则：

```javascript
module.exports = {
  dev: {
    proxyTable: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://auth.example.com',
        changeOrigin: true
      },
      '/upload': {
        target: 'http://upload.example.com',
        changeOrigin: true
      }
    }
  }
}
```

::: tip
更多代理配置选项请参考 [Webpack DevServer Proxy 文档](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)。
:::

## 本地 HTTPS

AKFun 支持开启本地 HTTPS 开发服务，适用于需要 HTTPS 环境的场景（如调用某些浏览器 API、对接第三方 HTTPS 服务等）。

### 开启方式

```javascript
module.exports = {
  dev: {
    https: true  // 默认为 false
  }
}
```

开启后，通过 `https://localhost/index.html` 访问项目。

### 浏览器安全设置

AKFun 使用自签名证书开启 HTTPS 服务，浏览器会提示安全性警告。需要进行以下设置：

**Chrome 浏览器：**

1. 在地址栏输入 `chrome://flags/#allow-insecure-localhost`
2. 将该选项设置为 **Enabled**
3. 重启浏览器

**其他浏览器：**

在安全提示页面选择"继续访问"或在浏览器设置中允许本地不安全的 localhost 连接。

::: warning 注意
自签名证书仅用于本地开发，不要在生产环境中使用。
:::
