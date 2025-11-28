# AKFun 前端脚手架

AKFun 是一个基于 Webpack 与 Rollup 的多场景前端打包工具，支持 Vue、React、React+TS 技术栈，致力于提供"零配置、开箱即用"的工程能力，让开发者专注业务。

## 目录

- [主要特性](#主要特性)
- [安装](#安装)
- [快速开始](#快速开始)
- [命令说明](#命令说明)
- [配置指南](#配置指南)
  - [配置文件说明](#配置文件说明)
  - [基础配置](#基础配置)
  - [开发配置](#开发配置)
  - [构建配置](#构建配置)
  - [高级配置](#高级配置)
- [其他说明](#其他说明)

---

## 主要特性

- **零配置**: 内置默认配置，开箱即用
- **多技术栈**: 支持 Vue、React、React+TS 的调试与构建
- **多构建场景**: 本地开发（含热更新/代理）、生产构建、库构建（UMD/ESM）、Node 模块构建
- **灵活可配**: 支持入口、别名、代理、SASS 注入、ESLint/StyleLint、Babel/Loader/Plugin 扩展等配置
- **样式与规范**: 集成 Autoprefixer、Sass、PostCSS、ESLint、StyleLint
- **参数替换**: 支持基于 [params-replace-loader](https://www.npmjs.com/package/params-replace-loader) 的环境变量批量替换
- **模板支持**: 提供完整的 Vue/React 项目模板
- **内置缓存机制**: 内置缓存机制，提升二次构建速度

---

## 安装

### 全局安装

```bash
yarn global add akfun
# 或
npm i -g akfun
```

### 项目内安装

```bash
yarn add akfun --dev
# 或
npm i akfun --save-dev
```

---

## 快速开始

### 方式一：创建新项目

1. **创建项目**（可指定模板与目录）
   ```bash
   akfun init -t=vue
   # 指定目录
   akfun init -t=vue --dir=myTest1
   ```

2. **安装依赖**
   ```bash
   cd myTest1
   npm install
   # 或
   yarn install
   ```

3. **开始开发**
   ```bash
   akfun dev
   ```

### 方式二：在现有项目中使用

1. **安装依赖**（见上方安装说明）

2. **初始化配置文件**
   ```bash
   akfun config init
   ```

3. **在 package.json 添加脚本**
   ```json
   {
     "scripts": {
       "dev": "akfun dev",
       "build": "akfun build",
       "build2lib": "akfun build2lib",
       "build2esm": "akfun build2esm"
     }
   }
   ```

4. **运行命令**
   ```bash
   npm run dev
   npm run build
   ```

---

## 命令说明

| 命令 | 说明 |
|------|------|
| `akfun init` | 交互式创建项目，支持 `-t`（模板类型）、`--dir`（目录名）参数 |
| `akfun config init` | 在当前项目生成 `akfun.config.js` 配置文件 |
| `akfun dev` | 启动本地开发服务器（含热更新、接口代理、可选 HTTPS、可选 ESLint/StyleLint） |
| `akfun build` | 生产环境构建（压缩优化、可选分析） |
| `akfun build2lib` | 构建 UMD 格式的库产物 |
| `akfun build2esm` | 构建 ESM 格式的库产物 |
| `akfun build2node` | 构建 Node 模块 |

---

## 配置指南

### 配置文件说明

AKFun 默认提供完整配置，开箱即用。如需自定义配置，执行 `akfun config init` 生成 `akfun.config.js` 文件，然后按需修改。

配置文件采用 CommonJS 格式，导出一个配置对象：

```javascript
module.exports = {
  // 配置项...
}
```

---

### 基础配置

#### 1. 代码规范检查

控制 ESLint 和 StyleLint 的启用与自动修复：

```javascript
module.exports = {
  settings: {
    enableESLint: true,        // 是否开启 ESLint，默认开启
    enableESLintFix: false,    // 是否 ESLint 自动修正代码格式
    enableStyleLint: true,     // 是否开启 StyleLint，默认开启
    enableStyleLintFix: false  // 是否 StyleLint 自动修正代码格式
  }
}
```

#### 2. 构建入口

配置构建入口文件，支持多入口。优先级：`dev/build/build2lib.entry` > `webpack.entry`

> **提示**: 建议以 key/value（object `{ <key>: string | [string] }`）配置 entry。详情参考 [Webpack 文档](https://www.webpackjs.com/configuration/entry-context/#entry)

```javascript
module.exports = {
  webpack: {
    entry: { 
      index: './src/index.js' 
    }
  },
  // 各场景可单独配置入口
  dev: { entry: {} },
  build: { entry: {} },
  build2lib: { entry: {} },
  build2esm: {
    input: resolve('src/main.js'),
    fileName: 'index'
  }
}
```

#### 3. 文件解析配置

配置模块解析的文件扩展名：

> 详情参考 [Webpack resolve.extensions 文档](https://www.webpackjs.com/configuration/resolve/#resolve-extensions)

```javascript
module.exports = {
  webpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.vue', '.json']
    }
  }
}
```

#### 4. 路径别名配置

配置模块路径别名，简化导入路径：

> 详情参考 [Webpack resolve.alias 文档](https://www.webpackjs.com/configuration/resolve/#resolve-alias)

```javascript
module.exports = {
  webpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        'components': resolve('src/components')
      }
    }
  }
}
```

#### 5. 页面模板与样式资源

```javascript
module.exports = {
  webpack: {
    template: '',              // 自定义页面模板路径
    sassResources: [           // 为每个 .scss 文件注入公共 SASS（变量、mixin、function 等）
      resolve('src/assets/css/mixin.scss'),
      resolve('src/assets/css/variables.scss')
    ]
  }
}
```

#### 6. 依赖打包策略

控制是否忽略 `node_modules` 中的依赖，减少打包体积：

```javascript
module.exports = {
  webpack: {
    ignoreNodeModules: true,   // 是否忽略 node_modules 中的依赖文件
    allowList: [               // 配置需要注入 bundle 的依赖包（ignoreNodeModules 为 true 时生效）
      'lodash',
      'axios'
    ]
  }
}
```

#### 7. TypeScript 配置

```javascript
module.exports = {
  webpack: {
    createDeclaration: true,    // 是否生成 TypeScript 声明文件
    projectDir: ['./src']      // 可配置多个目录，用于提升工程执行效率
  }
}
```

#### 8. 环境变量替换

基于 [params-replace-loader](https://www.npmjs.com/package/params-replace-loader) 实现环境变量批量替换：

> 详情参考 [params-replace-loader 使用文档](https://www.npmjs.com/package/params-replace-loader)

```javascript
module.exports = {
  envParams: {
    common: {                  // 通用参数
      '#version#': '20200810.1'
    },
    local: {                   // 本地开发环境
      '#dataApiBase#': 'http://localhost:1024',      // 数据接口根地址
      '#assetsPublicPath#': 'http://localhost:1024', // 静态资源根地址
      '#routeBasePath#': '/'                          // 路由根地址
    }
  }
}
```

---

### 开发配置

#### 开发服务器配置

配置开发服务器的端口、代理、资源路径等：

> 关于 proxyTable 的配置方法，参考 [Webpack DevServer Proxy 文档](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)

```javascript
module.exports = {
  dev: {
    NODE_ENV: 'development',           // development 模式，不会启动 UglifyJsPlugin
    port: 80,                          // 启动 server 服务的端口
    autoOpenBrowser: true,              // 是否自动打开页面
    assetsPublicPath: '/',              // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '',             // 资源引用二级路径
    hostname: 'localhost',              // 自动打开的页面主机
    proxyTable: {                       // 接口代理配置
      '/apiTest': {
        target: 'http://api-test.com.cn',  // 不支持跨域的接口根地址
        ws: true,                           // 启用 WebSocket
        changeOrigin: true                  // 改变请求头中的 origin
      }
    },
    cssSourceMap: false,                // CSS Source Map
    https: false                        // 是否启用 HTTPS（见下方 HTTPS 配置说明）
  }
}
```

#### 本地 HTTPS

启用本地 HTTPS 开发服务：

> 使用 `https://localhost/index.html` 访问当前项目

```javascript
module.exports = {
  dev: {
    https: true  // 默认不开启
  }
}
```

**注意事项**: akfun 使用自签名证书开启 HTTPS 服务，浏览器会提示安全性问题。需要进行如下设置：

- **Chrome**: 浏览器打开 `chrome://flags/#allow-insecure-localhost` 后将其设置为 `Enabled`
- **其他浏览器**: 类似设置允许本地不安全的 localhost 连接

---

### 构建配置

#### 生产环境构建

配置生产构建的输出路径、资源路径、压缩优化等：

```javascript
module.exports = {
  build: {
    NODE_ENV: 'production',                    // production 模式，会启动 UglifyJsPlugin
    assetsRoot: resolve('./dist'),              // 打包后的文件绝对路径（物理路径）
    assetsPublicPath: '/',                      // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '',                     // 资源引用二级路径
    productionSourceMap: false,                // 是否生成 Source Map
    productionGzip: false,                      // 是否开启 Gzip 压缩
    productionGzipExtensions: ['js', 'css', 'json'],  // Gzip 识别的文件后缀
    bundleAnalyzerReport: false                 // 是否开启打包分析功能
  }
}
```

#### 库构建（UMD）

构建 UMD 格式的库，适用于通过 `<script>` 标签或 CommonJS/AMD 方式引入：

```javascript
module.exports = {
  build2lib: {
    NODE_ENV: 'production',                    // production 模式
    libraryName: 'MyLibrary',                  // 构建第三方功能包时最后导出的引用变量名
    assetsRoot: resolve('dist'),               // 编译完成的文件存放路径
    assetsPublicPath: '/',                     // 设置静态资源的引用路径
    assetsSubDirectory: '',                    // 资源引用二级路径
    productionSourceMap: false,                // 是否生成 Source Map
    productionGzip: false,                      // 是否开启 Gzip 压缩
    productionGzipExtensions: ['js', 'css', 'json'],  // Gzip 识别的文件后缀
    bundleAnalyzerReport: false                // 是否开启打包分析功能
  }
}
```

#### 库构建（ESM）

构建 ESM 格式的库，适用于现代模块系统：

```javascript
module.exports = {
  build2esm: {
    input: resolve('src/main.js'),             // 入口文件
    fileName: 'index',                          // 输出的文件名称
    svgDir: 'src/icons/**'                     // 用于设置当前项目的 icon 所在目录，避免被 @rollup/plugin-image 编译成 base64 格式
  }
}
```

#### 构建 Node 模块

构建 Node 模块，通常用于构建 node cli 工具：

```javascript
module.exports = {
  build2node: {
    input: resolve('src/main.js'),             // 入口文件
    fileName: 'index',                          // 输出的文件名称
    outDir: 'src' // 输出目录
  }
}
```

---

### 高级配置

#### 自定义 Loader / Plugin / Babel Plugins

扩展 Webpack 的 Loader、Plugin 和 Babel 插件：

```javascript
module.exports = {
  webpack: {
    moduleRules: [],                           // 用于添加自定义 loaders
    plugins: [],                               // 用于添加自定义 plugins
    babelPlugins: [                            // 用于添加自定义 Babel plugins
      [
        'component',
        { 
          libraryName: 'element-ui', 
          styleLibraryName: 'theme-chalk' 
        }
      ]
    ]
  }
}
```

**示例**: 以上自定义 `babelPlugins` 用于实现 [element-ui 组件按需引入](https://element.eleme.cn/#/zh-CN/component/quickstart#an-xu-yin-ru)

**函数形式**: 也支持以函数形式动态调整内置 Babel Plugins：

```javascript
module.exports = {
  webpack: {
    babelPlugins: (curBabelPlugins) => {
      curBabelPlugins.push(/* your plugin */)
      return curBabelPlugins
    }
  }
}
```

#### 自定义 CSS Loader / PostCSS Loader

自定义 CSS 和 PostCSS 的处理配置：

```javascript
module.exports = {
  webpack: {
    cssLoaderOption: {
      import: false  // 启用/禁用 @import 解析
    },
    postCssLoaderOption: {                     // 自定义 postcss-loader 的配置
      postcssOptions: {
        plugins: [
          require('postcss-pxtorem')({          // 用于将 px 自动转化为 rem
            rootValue: 16,                     // 1rem 等于 16px
            propList: ['*']                    // 所有属性都转换
          })
        ]
      }
    }
  }
}
```

---

## 其他说明

### 多页面与模板

- **自动扫描入口**: 当 `entry` 仅配置一个且对应文件不存在时，会自动从 `src/pages` 扫描以 `.ts/.tsx/.js/.jsx` 结尾的文件作为入口，匹配同名 HTML 作为模板（对应正则 `/\.[tj]sx?$/`）

- **模板使用范围**: 仅 `dev` 和 `build` 使用页面模板；`build2lib` 不向页面注入打包产物

- **模板优先级**:
  1. 优先使用 `./src/index.html`
  2. 不存在时使用内置默认模板
  3. 多页面时，若 `pages` 下存在同名 HTML，将其作为页面模板

---

## 相关链接

- [Webpack 官方文档](https://webpack.js.org/)
- [Rollup 官方文档](https://rollupjs.org/)
- [params-replace-loader](https://www.npmjs.com/package/params-replace-loader)
