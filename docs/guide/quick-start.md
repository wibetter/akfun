# 快速开始

本节介绍两种使用 AKFun 的方式：从零创建新项目，以及在已有项目中集成。

## 方式一：创建新项目

适合从零开始搭建项目，AKFun 提供了交互式的项目创建流程。

### 1. 创建项目

使用 `akfun init` 命令创建项目，通过 `-t` 参数指定项目模板：

```bash
# 创建 Vue 项目
akfun init -t=vue

# 创建 React 项目
akfun init -t=react

# 指定项目目录名
akfun init -t=vue --dir=my-project
```

### 2. 安装依赖

进入项目目录，安装项目依赖：

::: code-group

```bash [yarn]
cd my-project
yarn install
```

```bash [npm]
cd my-project
npm install
```

:::

### 3. 启动开发

运行开发命令，启动本地开发服务器：

```bash
akfun dev
```

启动成功后，浏览器会自动打开项目页面（默认地址为 `http://localhost`）。开发过程中修改代码会自动触发热更新，无需手动刷新。

## 方式二：在已有项目中使用

如果你已经有一个前端项目，可以将 AKFun 集成进来作为构建工具。

### 1. 安装 AKFun

将 AKFun 安装为项目的开发依赖：

::: code-group

```bash [yarn]
yarn add akfun --dev
```

```bash [npm]
npm install akfun --save-dev
```

:::

### 2. 初始化配置文件

在项目根目录生成 `akfun.config.js` 配置文件：

```bash
akfun config init
```

该命令会在项目根目录创建一份包含默认配置的 `akfun.config.js` 文件，你可以根据项目需要进行修改。

### 3. 配置 npm scripts

在 `package.json` 中添加以下脚本命令：

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

### 4. 开始使用

::: code-group

```bash [开发模式]
npm run dev
```

```bash [生产构建]
npm run build
```

```bash [构建 UMD 库]
npm run build2lib
```

```bash [构建 ESM 库]
npm run build2esm
```

:::

## 项目目录结构

使用 `akfun init` 创建的项目通常具有以下目录结构：

```
my-project/
├── src/
│   ├── assets/          # 静态资源（图片、样式等）
│   ├── components/      # 公共组件
│   ├── pages/           # 页面文件（多页面模式）
│   ├── index.js         # 入口文件
│   └── index.html       # 页面模板
├── akfun.config.js      # AKFun 配置文件
├── package.json
└── README.md
```

## 下一步

- [命令说明](/guide/commands) — 了解所有可用命令及其参数
- [配置文件说明](/config/overview) — 了解如何自定义配置
