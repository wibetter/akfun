# AKFun 前端脚手架

> 支持多种技术栈：Vue技术栈、React技术栈、React&TS技术栈(开发中)

使用场景：提供vue/react前端项目的工程能力

技术栈：node/webpack


### 一、使用方法一：全局安装使用AKFun
注：可用于同时管理多个前端项目代码

- **1、全局安装**

```bash
#安装
$ npm i -g akfun
```

- **2、初始化项目(需要先创建一个新目录，用于存放新项目)**

```bash
$ akfun init -t=vue

#可选择初始化的项目类型：vue或者react，默认react类型的项目
```

- **3、使用：以全局命令方式构建项目**

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

### 二、使用方法二：本地安装使用AKFun
注：只作用于当前项目

- **2.1、本地安装**

```bash
$ npm i akfun --save-dev
```

- **2.2、在package.json中创建可执行脚本**

```bash
# 打开package.json，在scripts新增三条可执行命令
# 用于开启本地调试模式
$ "dev": "akfun dev"
# 用于构建生产环境代码
$ "build": "akfun build"
# 用于构建第三方功能包
$ "build2lib": "akfun build2lib"
```

- **2.3、构建项目**

```bash
# 1、开启本地调试模式
$ npm run dev
```

```bash
# 2、构建生产环境代码
$ npm run build
```

```bash
# 3、构建第三方功能包
$ npm run build2lib
```

### akfun的使用注意事项
1. akfun的默认构建入口文件：./src/index.js
2. 以项目根目录下的akfun.config.js为akfun的项目配置文件



