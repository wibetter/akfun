## AKFun 前端脚手架
AKFun 是一个基于 Webpack 与 Rollup 的多场景前端打包工具，支持 Vue、React、React+TS 技术栈，致力于提供“零配置、开箱即用”的工程能力，让开发者专注业务。

### 主要特性
- **零配置**: 内置默认配置，开箱即用；
- **多技术栈**: 支持 Vue、React、React+TS 的调试与构建；
- **多构建场景**: 本地开发（含热更新/代理）、生产构建、库构建（UMD/ESM）；
- **灵活可配**: 支持入口、别名、代理、SASS 注入、ESLint/StyleLint、Babel/Loader/Plugin 扩展等配置；
- **样式与规范**: 集成 Autoprefixer、Sass、PostCSS、ESLint、StyleLint；
- **参数替换**: 支持基于 [params-replace-loader](https://www.npmjs.com/package/params-replace-loader) 的环境变量批量替换；
- **模板支持**: 提供完整的 Vue/React 项目模板。

## 快速开始

### 方法一：全局安装
1) 安装
```bash
yarn global add akfun
# 或
npm i -g akfun
```
2) 创建项目（可指定模板与目录）
```bash
akfun init -t=vue
# 指定目录
akfun init -t=vue --dir=myTest1
```
3) 运行构建（需先安装依赖）
```bash
# 本地开发调试
akfun dev

# 生产环境构建
akfun build

# 构建库（UMD）
akfun build2lib

# 构建库（ESM）
akfun build2esm
```

### 方法二：在现有项目中使用
1) 安装到当前项目
```bash
yarn add akfun --dev
# 或
npm i akfun --save-dev
```
2) 在 package.json 添加脚本
```bash
"dev": "akfun dev",
"build": "akfun build",
"build2lib": "akfun build2lib",
"build2esm": "akfun build2esm"
```
3) 初始化配置文件（按需调整入口、别名、代理等）
```bash
akfun config init
```
4) 开发与构建
```bash
npm run dev
npm run build
npm run build2lib
npm run build2esm
```

## 常用命令
- **akfun init**: 交互式创建项目（支持 -t、--dir）。
- **akfun config init**: 在当前项目生成 `akfun.config.js`。
- **akfun dev**: 本地开发调试（含热更新、接口代理、可选 HTTPS、可选 ESLint/StyleLint）。
- **akfun build**: 生产环境构建（压缩优化、可选分析）。
- **akfun build2lib**: 构建 UMD 库产物。
- **akfun build2esm**: 构建 ESM 库产物。

## 多页面与模板
- 当 `entry` 仅配置一个且对应文件不存在时，会自动从 `src/pages` 扫描以 `.ts/.tsx/.js/.jsx` 结尾的文件作为入口，匹配同名 HTML 作为模板（对应正则 `/\.[tj]sx?$/`）。
- 仅 `dev` 和 `build` 使用页面模板；`build2lib` 不向页面注入打包产物。
- 优先使用 `./src/index.html`；不存在时使用内置默认模板。多页面时若 `pages` 下存在同名 HTML，将其作为页面模板。

## 配置说明（akfun.config.js）
AKFun 默认提供完整配置；如需自定义，执行 `akfun config init` 生成 `akfun.config.js` 并按需修改。以下为常用配置。

### 1) 基础规范与检查
```bash
module.exports = {
  settings: {
    enableESLint: true, // 是否开启ESLint，默认开启ESLint检测代码格式
    enableESLintFix: false, // 是否ESLint自动修正代码格式
    enableStyleLint: true, // 是否开启StyleLint，默认开启ESLint检测代码格式
    enableStyleLintFix: false // 是否需要StyleLint自动修正代码格式
  },
  ...
}
```

### 2) 构建入口（优先级：dev/build/build2lib.entry > webpack.entry）
> 备注：建议以 key/value（object { <key>: string | [string] }）配置 entry。详情参考 Webpack 文档：[关于 entry 的配置方法](https://www.webpackjs.com/configuration/entry-context/#entry)
```bash
module.exports = {
  ...
  webpack: {
    entry: { index: './src/index.js' },
  },
  ...
  dev: { entry: {} },
  build: { entry: {} },
  build2lib: { entry: {} },
  build2esm: {
    input: resolve('src/main.js'),
    fileName: 'index',
  },
  ...
}
```

### 3) 解析配置（extensions）
> 详情参考 Webpack 文档：[关于 resolve.extensions 的配置方法](https://www.webpackjs.com/configuration/resolve/#resolve-extensions)
```bash
module.exports = {
  ...
  webpack: {
    resolve: {
      extensions: ['.js', '.jsx', '.vue', 'json'],
    }
  },
  ...
}
```

### 4) 别名配置（alias）
> 详情参考 Webpack 文档：[关于 resolve.alias 的配置方法](https://www.webpackjs.com/configuration/resolve/#resolve-alias)
```bash
module.exports = {
  ...
  webpack: {
    resolve: {
      alias: {},
    }
  },
  ...
}
```

### 5) 页面模板与样式资源
```bash
module.exports = {
  ...
  webpack: {
    template: '', // 自定义页面模板
    sassResources: [], // 为每个 .scss 注入公共 SASS（变量、mixin、function 等）
  }
  ...
}
```

### 6) 依赖打包策略（忽略 node_modules）
> 打包过程中忽略 node_modules 依赖，减少最终体积；可通过 allowList 指定需注入 bundle 的依赖。
```bash
module.exports = {
  ...
  webpack: {
    ignoreNodeModules: true, // 是否忽略node_modules中的依赖文件
    allowList: [], // 用于配置会注入bundle中的依赖包（ignoreNodeModules为true时生效）
  }
  ...
}
```

### 7) TypeScript 声明文件与工程目录
```bash
module.exports = {
  ...
  webpack: {
    createDeclaration: true, // 是否生成ts声明文件
    projectDir: ['./src'], // 可配置多个目录，用于提升工程执行效率
  }
  ...
}
```

### 8) 环境变量替换（params-replace-loader）
> [关于 params-replace-loader 的使用方法](https://www.npmjs.com/package/params-replace-loader)
```bash
module.exports = {
  ...
  envParams: {
    common: { // 通用参数
      '#version#': '20200810.1',
    },
    local: { // 本地开发环境
      '#dataApiBase#': 'http://localhost:1024', // 数据接口根地址
      '#assetsPublicPath#': 'http://localhost:1024', // 静态资源根地址
      '#routeBasePath#': '/', // 路由根地址
    },
  }
  ...
}
```

### 9) 开发服务（代理与基础配置）
> [关于 proxyTable 的配置方法](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)
```bash
module.exports = {
  ...
  dev: {
    NODE_ENV: 'development', // development 模式，不会启动UglifyJsPlugin服务
    port: 80, // 启动server服务的端口
    autoOpenBrowser: true, // 是否自动打开页面
    assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '', // 资源引用二级路径
    hostname: 'localhost', // 自动打开的页面主机
    proxyTable: { // 接口代理
      '/apiTest': {
        target: 'http://api-test.com.cn', // 不支持跨域的接口根地址
        ws: true,
        changeOrigin: true
      }
    },
    cssSourceMap: false,
  },
  ...
}
```

### 10) 生产构建
```bash
module.exports = {
  ...
  build: {
    NODE_ENV: 'production', // production 模式，会启动UglifyJsPlugin服务
    assetsRoot: resolve('./dist'), // 打包后的文件绝对路径（物理路径）
    assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '', // 资源引用二级路径
    productionSourceMap: false, // 是否显示原始源代码
    productionGzip: false, // 是否开启Gzip服务
    productionGzipExtensions: ['js', 'css', 'json'], // Gzip识别的文件后缀
    bundleAnalyzerReport: false, // 开启打包分析功能
  }
  ...
}
```

### 11) 库构建（UMD）
```bash
module.exports = {
  ...
  build2lib: {
    NODE_ENV: 'production', // production 模式，会启动UglifyJsPlugin服务
    libraryName: '', // 构建第三方功能包时最后导出的引用变量名
    assetsRoot: resolve('dist'), // 编译完成的文件存放路径
    assetsPublicPath: '/', // 设置静态资源的引用路径（根域名+路径）
    assetsSubDirectory: '', // 资源引用二级路径
    productionSourceMap: false, // 是否显示原始源代码
    productionGzip: false, // 是否开启Gzip服务
    productionGzipExtensions: ['js', 'css', 'json'], // Gzip识别的文件后缀
    bundleAnalyzerReport: false, // 开启打包分析功能
  },
  ...
}
```

### 12) 库构建（ESM）
```bash
module.exports = {
  ...
  build2esm: {
    input: resolve('src/main.js'), // 入口文件
    fileName: 'index', // 输出的文件名称
    svgDir: 'src/icons/**', // 用于设置当前项目的icon所在目录，避免被 @rollup/plugin-image 编译成base64格式
  },
  ...
}
```

### 13) 自定义 Loader / Plugin / Babel Plugins
```bash
module.exports = {
  webpack: {
    moduleRules: [], // 用于添加自定义 loaders
    plugins: [], // 用于添加自定义 plugins
    babelPlugins: [  // 用于添加自定义 Babel plugins
      [
        'component',
        { libraryName: 'element-ui', styleLibraryName: 'theme-chalk' },
      ],
    ],
  },
}
```
备注: 以上自定义 babelPlugins 用于实现 [element-ui 组件按需引入](https://element.eleme.cn/#/zh-CN/component/quickstart#an-xu-yin-ru)。  

也支持以函数形式动态调整内置 Babel Plugins：  
```bash
module.exports = {
  webpack: {
    babelPlugins: (curBabelPlugins) => {
      curBabelPlugins.push(/* your plugin */)
      return curBabelPlugins
    },
  },
}
```

### 14) 自定义 css-loader / 自定义 postcss-loader
```bash
module.exports = {
  ...
  webpack: {
    cssLoaderOption: {
      import: false, // 启用/禁用 @import 解析
    },
    postCssLoaderOption: { // 自定义postcss-loader的配置
      postcssOptions: {
        plugins: [
          require('postcss-pxtorem')({ // 用于将px自动转化为rem
            rootValue: 16, // 1rem 等于 16px
            propList: ['*'], // 所有属性都转换
          }),
        ],
      }
    }
  }
  ...
}
```

### 15) 本地 HTTPS
> 使用 `https://localhost/index.html` 访问当前项目。
```bash
module.exports = {
  ...
  dev: {
    ...
    https: true, // 默认不开启
  }
  ...
}
```
备注：akfun使用自签名证书开启https服务，浏览器会提示安全性问题不能正常访问，需要进行如下设置，以 Chrome设置 为例：浏览器打开 Chrome://flags/#allow-insecure-localhost 后将其设置为Enabled。
