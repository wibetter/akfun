# 基础配置

本节介绍 AKFun 中最常用的基础配置项，包括代码规范检查、构建入口、路径别名、页面模板、环境变量替换等。

## 代码规范检查

通过 `settings` 配置项控制 ESLint 和 StyleLint 的启用状态及自动修复行为：

```javascript
module.exports = {
  settings: {
    enableESLint: true,        // 是否开启 ESLint 代码检查，默认 true
    enableESLintFix: false,    // 是否启用 ESLint 自动修复
    enableStyleLint: true,     // 是否开启 StyleLint 样式检查，默认 true
    enableStyleLintFix: false  // 是否启用 StyleLint 自动修复
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enableESLint` | `boolean` | `false` | 开启后，开发和构建时会进行 ESLint 检查 |
| `enableESLintFix` | `boolean` | `false` | 开启后，ESLint 会自动修复可修复的问题 |
| `enableStyleLint` | `boolean` | `false` | 开启后，开发和构建时会进行 StyleLint 检查 |
| `enableStyleLintFix` | `boolean` | `false` | 开启后，StyleLint 会自动修复可修复的问题 |

::: warning 注意
自动修复功能（`Fix`）会直接修改源文件，建议在开启前确保项目已纳入版本控制。
:::

## 构建入口

配置项目的构建入口文件，支持单入口和多入口。`entry` 是构建依赖图的起点，打包器会从这里出发，递归地找出所有依赖的模块。如果传入一个对象，每个键就是一个 chunk 的名称，值是该 chunk 的入口文件路径。

```javascript
module.exports = {
  webpack: {
    entry: {
      index: './src/index.js'
    }
  }
}
```

**多入口配置：**

适用于多页应用（MPA），每个入口对应一个独立的 HTML 页面：

```javascript
module.exports = {
  webpack: {
    entry: {
      index: './src/index.js',
      admin: './src/admin.js',
      mobile: './src/mobile.js'
    }
  }
}
```

你也可以为不同的构建场景单独配置入口，场景入口的优先级高于 `webpack.entry`：

```javascript
module.exports = {
  webpack: {
    entry: { index: './src/index.js' }  // 通用入口
  },
  dev: {
    entry: { index: './src/dev-index.js' }  // 开发模式专用入口
  },
  build: {
    entry: { index: './src/index.js' }  // 生产构建专用入口
  },
  build2lib: {
    entry: { index: './src/lib.js' }  // 库构建专用入口
  },
  build2esm: {
    input: './src/main.js',  // ESM 构建使用 input 字段
    fileName: 'index'
  }
}
```

::: tip 建议
推荐使用 `{ key: value }` 对象格式配置入口。一般规则：单页应用（SPA）使用一个入口，多页应用（MPA）使用多个入口。详情参考 [Webpack Entry 文档](https://www.webpackjs.com/configuration/entry-context/#entry)。
:::

## 文件解析配置

配置模块解析时尝试的文件扩展名，省去导入时写扩展名的麻烦。当导入语句没有带文件扩展名时（如 `import App from './App'`），会按照数组中的顺序依次尝试这些扩展名。如果多个文件同名但扩展名不同，排在前面的优先匹配。

```javascript
module.exports = {
  webpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
    }
  }
}
```

默认值已包含常用扩展名，通常无需修改。详情参考 [Webpack resolve.extensions 文档](https://www.webpackjs.com/configuration/resolve/#resolve-extensions)。

## 路径别名

配置模块路径别名，简化深层目录的导入路径。可以将常用的源码目录映射为简短的别名，避免冗长的相对路径。

```javascript
module.exports = {
  webpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '$components': resolve('src/components'),
        '$pages': resolve('src/pages'),
        '$utils': resolve('src/utils')
      }
    }
  }
}
```

配置后，你可以在代码中这样使用：

```javascript
// 之前
import Header from '../../../components/Header'

// 之后
import Header from '$components/Header'
```

别名的键名末尾加 `$` 表示精确匹配，例如 `{ 'vue$': resolve('src/custom-vue.js') }` 只会匹配 `import 'vue'`，不会匹配 `import 'vue/xxx'`。

将别名设置为 `false` 可以忽略某个模块（不进行解析），适用于排除不需要的 polyfill 等场景。

::: tip
`resolve` 函数需要自行引入，通常使用 Node.js 的 `path.resolve`：
```javascript
const path = require('path')
const resolve = (dir) => path.resolve(__dirname, dir)
```
:::

## 页面模板与公共样式

### 自定义页面模板

指定自定义的 HTML 页面模板路径。AKFun 会基于此模板生成最终的 HTML 文件，并自动注入构建产物的 `<script>` 和 `<link>` 标签：

```javascript
module.exports = {
  webpack: {
    template: './src/index.html'  // 自定义页面模板路径
  }
}
```

模板中可以使用 EJS 语法插入动态内容，如页面标题、环境变量等。

### 公共 Sass 资源注入

为每个 `.scss` 文件自动注入公共的 Sass 变量、Mixin、函数等，无需在每个文件中手动 `@import`：

```javascript
module.exports = {
  webpack: {
    sassResources: [
      resolve('src/assets/css/variables.scss'),  // 全局变量
      resolve('src/assets/css/mixin.scss')       // 全局 Mixin
    ]
  }
}
```

::: tip
适合将项目中的主题色、间距、字体等全局变量统一管理。注入的文件内容会被添加到每个 `.scss` 文件的顶部。
:::

## 依赖打包策略

控制是否将 `node_modules` 中的依赖打包进产物。在构建第三方库时，通常希望将依赖排除在产物之外，由使用方自行安装：

```javascript
module.exports = {
  webpack: {
    ignoreNodeModules: true,  // 忽略 node_modules 中的依赖
    allowList: [              // 白名单：即使忽略 node_modules，这些包仍会被打包
      'lodash',
      'axios'
    ]
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `ignoreNodeModules` | `boolean` | `false` | 是否忽略 node_modules 中的依赖，开启后依赖不会被打包进产物 |
| `allowList` | `string[]` | `[]` | 需要打包的依赖白名单（仅在 `ignoreNodeModules` 为 `true` 时生效），适用于没有提供编译版本的包 |

## TypeScript 配置

控制 TypeScript 相关的构建行为：

```javascript
module.exports = {
  webpack: {
    createDeclaration: true,   // 构建时生成 TypeScript 声明文件（.d.ts）
    projectDir: ['./src']      // 指定 TypeScript 项目目录，提升编译效率
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `createDeclaration` | `boolean` | `false` | 构建时是否生成 `.d.ts` 类型声明文件，发布 npm 包时建议开启，方便使用方获得类型提示 |
| `projectDir` | `string[]` | — | 指定 TypeScript 项目目录，缩小编译范围以提升构建速度，避免扫描不必要的目录 |

## 环境变量替换

基于 [params-replace-loader](https://www.npmjs.com/package/params-replace-loader) 实现多环境参数的批量替换。你可以在代码中使用占位符，构建时会自动替换为对应环境的实际值。

```javascript
module.exports = {
  envParams: {
    common: {
      '#version#': '20200810.1'  // 所有环境通用的参数
    },
    local: {
      '#dataApiBase#': 'http://localhost:1024',      // 本地开发环境
      '#assetsPublicPath#': 'http://localhost:1024',
      '#routeBasePath#': '/'
    },
    online: {
      '#dataApiBase#': '/',           // 线上正式环境
      '#assetsPublicPath#': '',
      '#routeBasePath#': '/'
    }
  }
}
```

**在代码中使用：**

```javascript
// 源代码
const apiBase = '#dataApiBase#'

// 本地开发构建后
const apiBase = 'http://localhost:1024'

// 线上环境构建后
const apiBase = '/'
```

::: tip
`common` 中的参数在所有环境中都会生效。`local` 对应 `akfun dev`，`online` 对应 `akfun build`。你可以根据需要添加更多环境（如 `test`、`staging` 等）。
:::
