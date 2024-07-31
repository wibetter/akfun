# AKFun 前端脚手架
> AKFun 是一个基于 Webpack 和 rollup 的前端多场景打包工具，支持多种技术栈：Vue技术栈、React技术栈、React&TS技术栈
- 核心理念：提供完整&全面的前端工程能力，并尽可能屏蔽掉前端工程相关配置，让开发者更专注业务研发工作。
- 技术栈：node/webpack/rollup/babel/eslint/stylelint

## 特性
- ⚡️ 零配置，开箱即用
- 👏 支持Vue和React项目的调试和构建
- 支持单页面和多页面
- 提供三种构建场景: 本地开发模式(包含热更新、接口代理等功能)、生产环境代码构建、library库构建(支持umd和esm的打包能力)
- 开放配置能力: 可配置构建入口文件、开启ESLint代码检测、接口代理等
- 支持 [Autoprefixer](https://github.com/postcss/autoprefixer#readme)、[Sass](https://sass-lang.com/)、[PostCSS](https://postcss.org/)、[ESLint](http://eslint.cn/)、[StyleLint](https://stylelint.io/)
- 支持项目系统参数自动批量替换 [params-replace-loader](https://www.npmjs.com/package/params-replace-loader)
- 提供完整的Vue和React项目模板

## 快速开始 / 使用方法一
> 全局安装AKFun，用于同时管理多个前端项目代码（可使用AKFun创建一个新项目）

1. **全局安装**
```bash
$ yarn global add akfun 或者  npm i -g akfun
```

2. **初始化一个项目**
> 可选择项目类型：vue或者react，默认react类型的项目，也可通过--dir参数指定存放项目模板的目录
```bash
$ akfun init -t=vue
```

3. **开始使用：以全局命令方式构建项目（确保已yarn install或者npm install）**

```bash
# 1、开启本地调试模式
$ akfun dev
```

```bash
# 2、构建生产环境代码
$ akfun build
```

```bash
# 3、构建第三方功能包（以umd格式输出）
$ akfun build2lib
```

```bash
# 4、构建第三方功能包的esm输出格式
$ akfun build2esm
```

## 快速开始 / 使用方法二
> 在现有项目中局部安装AKFun，给现有项目赋予AKFun的前端工程能力

1. **本地安装**

```bash
$ yarn add akfun --dev 或者 npm i akfun --save-dev
```

2. **在package.json中创建可执行脚本**
> 打开package.json，在scripts中新增三条可执行命令

```bash
# 用于开启本地调试模式
"dev": "akfun dev"

# 用于构建生产环境代码
"build": "akfun build"

# 用于构建第三方功能包（以umd格式输出）
"build2lib": "akfun build2lib"

# 用于构建第三方功能包（以esm格式输出）
"build2esm": "akfun build2esm"
```

3. **创建AKFun的配置文件**
> 需要根据实际情况调整配置文件内（比如：入口文件、路径缩写、接口代理等）

    ```bash
    $ akfun config init
    ```

4. **开始构建当前项目**

   4.1 开启本地调试模式
    ```bash
    $ npm run dev
    ```
   4.2 构建生产环境代码
   ```bash
   $ npm run build
   ```
   4.3 构建第三方功能包（以umd格式输出）
   ```bash
   $ npm run build2lib
   ```
   4.4 构建第三方功能包（以esm格式输出）
   ```bash
   $ npm run build2esm
   ```

## AKFun使用说明

1. **使用AKFun新建一个新项目**

    1.1 创建一个react项目
    ```bash
    $ akfun init
    ```
    1.2 创建一个vue类型项目
    ```bash
    $ akfun init -t=vue
    ```
    1.3 在指定的目录中创建一个新项目
    ```bash
    $ akfun init -t=vue --dir=myTest1
    ```

2. **创建AKFun的配置文件**
    ```bash
    $ akfun config init
    ```

3. **关于AKFun提供三种构建场景**
    1. **dev**: 本地开发调试模式，用于本地开发和调试项目(包含热更新、接口代理等功能)，编译的代码没有压缩，默认会开启ESLint检测代码规范（可关闭）
    2. **build**: 用于构建生产环境代码，编译输出的代码会进行压缩优化
    3. **build2lib**: 用于构建library库，以umd进行输出
    4. **build2esm**: 用于构建library库，以esm进行输出

4. **关于AKFun的配置文件**
    1. AKFun会提供全量的默认配置，实现零配置、开箱即用的能力
    2. 自定义构建配置，请在当前项目根目录创建AKFun配置文件（akfun.config.js），AKFun提供初始化配置文件的方法：
    ```bash
    $ akfun config init
    ```
    3. akfun.config.js为当前项目的配置文件，优先级最高（可覆盖AKFun提供的默认配置）

5. **配置构建入口文件（webpack.entry）**
    1. 默认的构建入口文件: ./src/index.js
    2. 自定义构建入口(akfun.config.js中提供对应的配置入口)
        1. 在webpack.entry配置构建入口，dev\build\build2lib都会以此为构建入口 ([关于entry的配置方法](https://www.webpackjs.com/configuration/entry-context/#entry))
        2. 在dev.entry、build.entry、build2lib.entry中配置对应执行环境的构建入口，优先级高于webpack.entry

6. **关于多页面**
    1. 当akfun.config.js的entry只有一个入口配置，且对应的构建入口文件不存在时，AKFun会自动从src/pages中获取构建入口（支持多页面多模板）
    2. 多页面模式下，会自动将src/pages中以.ts、.tsx、.js、.jsx结尾（对应的匹配正则：/\.[tj]sx?$/）的文件作为构建入口文件，同时将同名的html文件作为当前页面模板

7. **关于多页面多模板**
    1. 只有dev和build的构建过程中才会使用到页面模板，build2lib构建中不会将打包完成的代码输出到页面模板中
    2. 默认使用./src/index.html作为页面模板
    3. 当项目中./src/index.html不存在时，会使用AKFun的提供的默认页面模板
    4. 多页面模式时，如果pages下存在对应的html页面（与入口文件同名的html文件），会自动将其设置为页面模板

## AKFun开放的配置能力
> AKFun配置文件（akfun.config.js），以下使用AKFunConfig代表akfun.config.js配置对象
1. 开启/关闭 ESLint代码规范检测: AKFunConfig.settings.enableEslint (也可配置StyleLint的使用)
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
2. 配置构建入口文件: 关于配置优先级请查看 AKFun使用说明 / 配置构建入口文件
> 以下是entry的配置位置，具体配置方法请查看Webpack官网 ([关于entry的配置方法](https://www.webpackjs.com/configuration/entry-context/#entry))
> 备注：建议以key/value形式（object { <key>: string | [string] }）配置entry
```bash
module.exports = {
  ...
  webpack: {
    entry: {
      index: './src/index.js',
    }
  },
  ...
  dev: {
    entry: {}
  }
  build: {
    entry: {}
  }
  build2lib: {
    entry: {}
  }
  build2esm: {
    input: resolve('src/main.js'),
    fileName: 'index',
  }
  ...
}
```

3. 解析(resolve) / extensions配置: 自动解析确定的扩展（配置可识别的文件后缀）
> 以下是extensions的配置位置，具体配置方法请查看Webpack官网 ([关于resolve-extensions的配置方法](https://www.webpackjs.com/configuration/resolve/#resolve-extensions))
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

4. 解析(resolve) / alias配置: 创建 import 或 require 的别名，来确保模块引入变得更简单
> 以下是alias的配置位置，具体配置方法请查看Webpack官网 ([关于resolve-alias的配置方法](https://www.webpackjs.com/configuration/resolve/#resolve-alias))
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
5. 页面模板路径配置：关于页面模板请查看 AKFun使用说明 / 关于页面模板
```bash
module.exports = {
  ...
  webpack: {
    template: '',
  }
  ...
}
```

6. 注入公共的SASS文件
> 为项目中每个.scss后缀的样式文件注入公共的SASS内容（变量、mixin、function等）
```bash
module.exports = {
  ...
  webpack: {
    sassResources: [],
  }
  ...
}
```

7. 打包忽略node_modules配置项: ignoreNodeModules（默认为false）
> 打包过程中，忽略node_modules中的依赖文件，不注入到bundle中，减少最后生成代码体积
```bash
module.exports = {
  ...
  webpack: {
    ignoreNodeModules: true,
    allowList: [], // 用于配置会注入bundle中的依赖包（ignoreNodeModules为true时生效）
  }
  ...
}
```

8. 是否生成ts声明文件配置项: createDeclaration（默认为false）
> 构建ts项目中，可以选择是否生成ts声明文件
```bash
module.exports = {
  ...
  webpack: {
    createDeclaration: true,
  }
  ...
}
```

9. 配置项目源码目录（工程有效目录范围）: projectDir
> 构建项目中，设置生效的目录（可同时设置多个目录），用于提高前端工程执行效率。可以不配置，默认为['./src']
```bash
module.exports = {
  ...
  webpack: {
    projectDir: ['./src'],
  }
  ...
}
```

10. 项目源码环境变量批量替换
> [关于params-replace-loader的使用方法](https://www.npmjs.com/package/params-replace-loader)
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

11. 接口代理配置：目前只有dev本地开发调试模式下会启动
> [关于proxyTable的配置方法](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)
```bash
module.exports = {
  ...
  dev: {
    proxyTable: {
    },
  }
  ...
}
```

12. 用于开启本地调试模式的相关配置信息
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

13. 用于构建生产环境代码的相关配置信息
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

14. 用于构建第三方功能包的配置（以umd格式输出）
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

15. 用于构建esm格式的第三方功能包配置
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

16. 自定义css-loader的配置
> 比如用于启用/禁用 @import 解析。
```bash
module.exports = {
  ...
  webpack: {
    ...
    cssLoaderOption: {
      import: false, // 启用/禁用 @import 解析
    }
  }
  ...
}
```

17. 自定义postcss-loader的配置
> 比如用于添加 PostCSS 选项与插件。
```bash
module.exports = {
  ...
  webpack: {
    ...
    postCssLoaderOption: {
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

18. 本地开启https服务
> 使用 https://localhost/index.html 访问当前项目。
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
