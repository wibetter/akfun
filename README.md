# AKFun 前端脚手架

> AKFun 是一个基于 Webpack4.0 的打包工具，支持多种技术栈：Vue技术栈、React技术栈、React&TS技术栈(开发中)
- 技术栈：node/webpack4.0/express/babel/eslint/stylelint

## 特性
- ⚡️ 零配置，开箱即用
- 👏 支持Vue和React项目的构建
- 📤 支持单页面和多页面
- 💪 提供三种构建场景: 本地开发调试模式(包含热更新、接口代理等功能)、构建生产环境代码、library库的构建(统一以UMD进行输出)
- ❤️ 开放配置能力: 可配置构建入口文件、是否开启ESLint代码规范检测、resolve和externals配置、接口代理配置等
- 👍 支持 [Sass](https://sass-lang.com/)、[params-replace-loader](https://www.npmjs.com/package/params-replace-loader)、[ESLint](http://eslint.cn/)、[StyleLint](https://github.com/stylelint)
- 😀 提供完整的Vue和React项目模板

## 快速开始 / 使用方法一
> 全局安装AKFun，用于同时管理多个前端项目代码，可使用AKFun创建一个新项目

1. **全局安装**

```bash
$ npm i -g akfun 或者 yarn add akfun global
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
# 3、构建第三方功能包
$ akfun build2lib
```

## 快速开始 / 使用方法二
> 在现有项目中局部安装AKFun，给现有项目赋予AKFun的前端工程能力

1. **本地安装**

```bash
$ npm i akfun --save-dev 或者 yarn add akfun --dev
```

2. **在package.json中创建可执行脚本**
> 打开package.json，在scripts中新增三条可执行命令

```bash
# 用于开启本地调试模式
"dev": "akfun dev"
# 用于构建生产环境代码
"build": "akfun build"
# 用于构建第三方功能包
"build2lib": "akfun build2lib"
```

3. **开始构建当前项目**

   3.1 开启本地调试模式
    ```bash
    $ npm run dev
    ```
   3.2 构建生产环境代码
   ```bash
   $ npm run build
   ```
   3.3 构建第三方功能包
   ```bash
   $ npm run build2lib
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
    3. **build2lib**: 用于构建library库，目前统一以UMD进行输出

4. **关于AKFun的配置文件**
    1. AKFun会提供全量的配置数据，实现零配置开箱即用的能力
    2. 如果需要调整构建配置，请在当前项目根目录创建AKFun配置文件（akfun.config.js），AKFun提供初始化配置文件的方法：
    ```bash
    $ akfun config init
    ```
    3. akfun.config.js为当前项目的配置文件，优先级最高（可覆盖AKFun提供的默认配置）

5. **配置构建入口文件（webpack.entry）**
    1. 默认的构建入口文件: ./src/index.js
    2. 自定义构建入口(akfun.config.js中提供对应的配置入口)
        1. 在webpack.entry配置构建入口，dev\build\build2lib都会以此为构建入口 [关于entry的配置方法](https://www.webpackjs.com/configuration/entry-context/#entry)
        2. 在dev.entry、build.entry、build2lib.entry中配置对应执行环境的构建入口，优先级高于webpack.entry

6. **关于多页面**
    1. 当./src/index.js不存在，且在akfun.config.js中没有对应的entry配置时，AKFun会自动从src/pages中获取构建入口（支持多页面多模板）
    2. 多页面模式下，会自动将src/pages中以.ts、.tsx、.js、.jsx结尾（对应的匹配正则：/\.[tj]sx?$/）的文件作为构建入口文件

7. **关于多页面多模板**
    1. 只有dev和build的构建过程中才会使用到页面模板，build2lib构建中不会将打包完成的代码输出到页面模板中
    2. 默认使用./src/index.html作为页面模板
    3. 当项目中./src/index.html不存在时，会使用AKFun的提供的默认页面模板
    4. 多页面模式时，如果pages下存在对应的html页面（与入口文件同名的html文件），会自动将其设置为页面模板

## AKFun开放的配置能力

