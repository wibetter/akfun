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
| `NODE_ENV` | `string` | `'production'` | 环境模式。`production` 模式会启用代码压缩、Tree Shaking、作用域提升等优化，产物体积更小、运行更快 |
| `assetsRoot` | `string` | `resolve('dist')` | 构建产物的输出目录，必须是绝对路径。构建完成后所有文件都会输出到此目录 |
| `assetsPublicPath` | `string` | `'/'` | 静态资源的引用根路径，所有资源 URL 都会以此值为前缀。部署到子路径时需要修改（如 `'/my-app/'`），使用 CDN 时设为 CDN 地址（如 `'https://cdn.example.com/assets/'`） |
| `assetsSubDirectory` | `string` | `''` | 静态资源的二级路径，会拼接在 `assetsPublicPath` 之后 |
| `productionSourceMap` | `boolean` | `false` | 是否生成 Source Map 文件。Source Map 用于将压缩后的代码映射回原始源代码，方便在浏览器中调试线上问题 |
| `productionGzip` | `boolean` | `false` | 是否开启 Gzip 压缩，构建时为每个资源额外生成 `.gz` 文件，需要服务器端配合开启 Gzip 静态文件服务 |
| `productionGzipExtensions` | `string[]` | `['js', 'css', 'json']` | Gzip 压缩的文件类型，指定哪些扩展名的文件需要生成 `.gz` 版本 |
| `bundleAnalyzerReport` | `boolean` | `false` | 是否生成打包分析报告，构建完成后会打开一个可视化页面，展示各模块的体积占比，帮助找出优化空间 |

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
开启 Source Map 会增加构建时间和产物体积，且可能暴露源代码。建议仅在需要线上调试时临时开启，排查完问题后关闭。
:::

### Gzip 压缩

开启 Gzip 压缩可以显著减小传输体积（通常可压缩 60%~80%），但需要服务器端配合支持：

```javascript
module.exports = {
  build: {
    productionGzip: true,
    productionGzipExtensions: ['js', 'css', 'json']
  }
}
```

::: tip
许多托管平台（如 Netlify、Vercel）和 Web 服务器（如 Nginx）已支持自动 Gzip 压缩，此时无需在构建时开启。构建时生成 `.gz` 文件主要适用于服务器不支持动态压缩的场景。
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

构建完成后会自动打开一个可视化的分析页面，展示各模块的体积占比。你可以据此判断是否需要拆分代码、按需引入或使用 CDN 加载某些大型依赖。


## UMD 库构建（build2lib）

`akfun build2lib` 将项目构建为 UMD 格式的库文件，适用于通过 `<script>` 标签、CommonJS 或 AMD 方式引入。

UMD（Universal Module Definition）是一种兼容多种模块系统的格式，生成的代码会自动检测当前环境并选择合适的模块加载方式，可以在浏览器全局变量、CommonJS 和 AMD 环境下使用。

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
| `libraryName` | `string` | `''` | 库的全局变量名。通过 `<script>` 标签引入后，可以通过 `window.MyLibrary` 访问库的导出内容 |

其余配置项与 [生产构建](#生产构建-build) 相同。

### 使用示例

配置 `libraryName` 为 `'MyUtils'` 后，构建产物可以这样使用：

```html
<!-- 通过 script 标签引入（全局变量） -->
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

::: tip
`libraryName` 应使用合法的 JavaScript 标识符（如 `MyUtils`、`MyLib`），避免使用连字符等特殊字符。
:::

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
| `input` | `string` | — | 入口文件路径，构建的起点。通常指向库的主入口文件 |
| `fileName` | `string` | — | 输出的文件名（不含扩展名），最终生成 `<fileName>.esm.js` |
| `svgDir` | `string` | — | SVG 图标目录的 glob 匹配模式，匹配到的 SVG 文件会保持原始格式，不会被转为 base64 |

### 使用场景

ESM 格式适合发布到 npm 的组件库或工具库。使用方可以通过 `import` 引入，打包工具会自动进行 Tree Shaking，只打包实际用到的部分：

```javascript
// 使用方只引入需要的组件，未使用的不会被打包
import { Button, Input } from 'my-component-lib'
```

::: tip
发布 npm 包时，建议在 `package.json` 中通过 `module` 字段指向 ESM 产物路径，方便打包工具识别。
:::


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
| `input` | `string` | — | 入口文件路径，构建的起点 |
| `fileName` | `string` | — | 输出的文件名（不含扩展名），最终生成 `<fileName>.js` |
| `outDir` | `string` | — | 输出目录，构建产物将放置在此目录下 |

### 使用场景

适合构建 Node CLI 工具或服务端脚本。构建后的产物可以直接通过 `node` 命令运行：

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

::: tip
发布 CLI 工具时，在 `package.json` 中通过 `bin` 字段指向构建产物，安装后即可作为命令行工具使用。
:::
