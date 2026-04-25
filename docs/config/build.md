# 构建配置

本节介绍 AKFun 的各种构建模式配置，包括生产构建、UMD 库构建、ESM 库构建和 Node 模块构建。

## 生产构建（build）

`akfun build` 用于构建生产环境的静态资源，输出经过压缩优化的文件。

### 完整配置

```javascript
const path = require('path')
const resolve = (dir) => path.resolve(__dirname, dir)

module.exports = {
  build: {
    NODE_ENV: 'production',
    assetsRoot: resolve('./dist'),
    assetsPublicPath: '/',
    assetsSubDirectory: '',
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css', 'json'],
    bundleAnalyzerReport: false
  }
}
```

### 配置项详解

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | `string` | `'production'` | 环境模式，`production` 会启用代码压缩（UglifyJS） |
| `assetsRoot` | `string` | `resolve('dist')` | 构建产物的输出目录（绝对路径） |
| `assetsPublicPath` | `string` | `'/'` | 静态资源的引用根路径 |
| `assetsSubDirectory` | `string` | `''` | 静态资源的二级路径 |
| `productionSourceMap` | `boolean` | `false` | 是否生成 Source Map 文件 |
| `productionGzip` | `boolean` | `false` | 是否开启 Gzip 压缩 |
| `productionGzipExtensions` | `string[]` | `['js', 'css', 'json']` | Gzip 压缩的文件类型 |
| `bundleAnalyzerReport` | `boolean` | `false` | 是否生成打包分析报告 |

### Source Map

Source Map 用于在浏览器中调试压缩后的代码。生产环境默认关闭，如需开启：

```javascript
module.exports = {
  build: {
    productionSourceMap: true
  }
}
```

::: warning 注意
开启 Source Map 会增加构建时间和产物体积，且可能暴露源代码。建议仅在需要线上调试时开启。
:::

### Gzip 压缩

开启 Gzip 压缩可以显著减小传输体积，但需要服务器端配合支持：

```javascript
module.exports = {
  build: {
    productionGzip: true,
    productionGzipExtensions: ['js', 'css', 'json']
  }
}
```

::: tip
许多托管平台（如 Netlify、Vercel）已自动对静态资源进行 Gzip 压缩，此时无需在构建时开启。
:::

### 打包分析

开启打包分析报告，帮助你了解产物的体积分布，找出优化空间：

```javascript
module.exports = {
  build: {
    bundleAnalyzerReport: true
  }
}
```

构建完成后会自动打开一个可视化的分析页面，展示各模块的体积占比。


## UMD 库构建（build2lib）

`akfun build2lib` 将项目构建为 UMD 格式的库文件，适用于通过 `<script>` 标签、CommonJS 或 AMD 方式引入。

### 完整配置

```javascript
module.exports = {
  build2lib: {
    NODE_ENV: 'production',
    libraryName: 'MyLibrary',
    assetsRoot: resolve('dist'),
    assetsPublicPath: '/',
    assetsSubDirectory: '',
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css', 'json'],
    bundleAnalyzerReport: false
  }
}
```

### 配置项详解

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `libraryName` | `string` | `''` | 库的全局变量名，通过 `<script>` 引入后可通过此名称访问 |

其余配置项与 [生产构建](#生产构建-build) 相同。

### 使用示例

配置 `libraryName` 为 `'MyUtils'` 后，构建产物可以这样使用：

```html
<!-- 通过 script 标签引入 -->
<script src="dist/index.js"></script>
<script>
  // 通过全局变量访问
  MyUtils.doSomething()
</script>
```

```javascript
// CommonJS
const MyUtils = require('my-utils')

// ES Module
import MyUtils from 'my-utils'
```

## ESM 库构建（build2esm）

`akfun build2esm` 基于 **Rollup** 将项目构建为 ESM 格式的库文件，支持 Tree Shaking，适用于现代模块系统。

### 完整配置

```javascript
module.exports = {
  build2esm: {
    input: resolve('src/main.js'),
    fileName: 'index',
    svgDir: 'src/icons/**'
  }
}
```

### 配置项详解

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `input` | `string` | — | 入口文件路径 |
| `fileName` | `string` | — | 输出的文件名（不含扩展名） |
| `svgDir` | `string` | — | SVG 图标目录的 glob 匹配模式，避免被 `@rollup/plugin-image` 转为 base64 |

### 使用场景

ESM 格式适合发布到 npm 的组件库或工具库，使用方可以通过 `import` 引入并享受 Tree Shaking 的优化：

```javascript
// 使用方
import { Button, Input } from 'my-component-lib'
```


## Node 模块构建（build2node）

`akfun build2node` 基于 **Rollup** 将项目构建为 Node 模块，适用于构建 CLI 工具或服务端脚本。

### 完整配置

```javascript
module.exports = {
  build2node: {
    input: resolve('src/main.js'),
    fileName: 'index',
    outDir: 'src'
  }
}
```

### 配置项详解

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `input` | `string` | — | 入口文件路径 |
| `fileName` | `string` | — | 输出的文件名（不含扩展名） |
| `outDir` | `string` | — | 输出目录 |

### 使用场景

适合构建 Node CLI 工具，例如：

```javascript
// src/main.js
#!/usr/bin/env node
const { program } = require('commander')

program
  .version('1.0.0')
  .command('start')
  .action(() => {
    console.log('Hello from CLI!')
  })

program.parse(process.argv)
```
