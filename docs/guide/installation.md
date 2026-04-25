# 安装

AKFun 支持全局安装和项目内安装两种使用方式，根据你的使用场景选择合适的使用方式。

## 环境要求

- **Node.js** >= 12.0.0
- **npm** >= 6.0.0 或 **yarn** >= 1.0.0

## 全局安装

全局安装后，可以在任意目录下使用 `akfun` 命令来创建项目、启动开发服务器或执行构建。

::: code-group

```bash [yarn]
yarn global add akfun
```

```bash [npm]
npm install -g akfun
```

:::

安装完成后，验证是否安装成功：

```bash
akfun --version
```

::: tip 推荐场景
全局安装适合需要频繁使用 `akfun init` 创建新项目的场景。
:::

## 项目内安装

将 AKFun 作为项目的开发依赖安装，适合在已有项目中集成使用。

::: code-group

```bash [yarn]
yarn add akfun --dev
```

```bash [npm]
npm install akfun --save-dev
```

:::

安装后，在 `package.json` 的 `scripts` 中配置命令即可使用：

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

::: tip 推荐场景
项目内安装可以锁定 AKFun 版本，确保团队成员使用一致的构建工具版本，避免因版本差异导致的构建问题。
:::

## 下一步

安装完成后，前往 [快速开始](/guide/quick-start) 了解如何使用 AKFun 创建或配置项目。
