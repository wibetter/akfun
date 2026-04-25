# 配置文件说明

AKFun 默认提供了一套完整的内置配置，开箱即用。如果你需要自定义项目的构建行为，可以通过配置文件进行调整。

## 生成配置文件

在项目根目录执行以下命令，生成 `akfun.config.js` 配置文件：

```bash
akfun config init
```

## 配置文件格式

配置文件采用 **CommonJS** 格式，导出一个配置对象：

```javascript
module.exports = {
  settings: { /* 代码规范检查 */ },
  webpack: { /* Webpack 相关配置 */ },
  envParams: { /* 环境变量替换 */ },
  dev: { /* 开发服务器配置 */ },
  build: { /* 生产构建配置 */ },
  build2lib: { /* UMD 库构建配置 */ },
  build2esm: { /* ESM 库构建配置 */ },
  build2node: { /* Node 模块构建配置 */ },
}
```

## 配置结构总览

| 配置项 | 说明 | 详细文档 |
|--------|------|---------|
| `settings` | ESLint / StyleLint 开关与自动修复 | [基础配置](/config/basic#代码规范检查) |
| `webpack` | 入口、别名、扩展名、模板、Sass 注入、Loader / Plugin 扩展等 | [基础配置](/config/basic) / [高级配置](/config/advanced) |
| `envParams` | 多环境参数替换 | [基础配置](/config/basic#环境变量替换) |
| `dev` | 开发服务器端口、代理、HTTPS 等 | [开发配置](/config/dev) |
| `build` | 生产构建输出路径、Source Map、Gzip 等 | [构建配置](/config/build) |
| `build2lib` | UMD 库构建配置 | [构建配置](/config/build#umd-库构建-build2lib) |
| `build2esm` | ESM 库构建配置 | [构建配置](/config/build#esm-库构建-build2esm) |
| `build2node` | Node 模块构建配置 | [构建配置](/config/build#node-模块构建-build2node) |

## 配置优先级

AKFun 的配置遵循以下优先级规则（从高到低）：

1. **场景专属入口配置** — `dev.entry` / `build.entry` / `build2lib.entry`
2. **通用 Webpack 入口** — `webpack.entry`
3. **内置默认配置** — AKFun 内置的默认值

也就是说，如果你在 `dev.entry` 中配置了入口，它会覆盖 `webpack.entry` 中的配置。

## 配置文件查找顺序

AKFun 会按以下顺序查找配置文件（找到第一个即停止）：

1. `akfun.config.js`
2. `akfun.config.json`
3. `.akfunrc.js`
4. `.akfunrc.json`

::: tip
大多数情况下，使用 `akfun.config.js` 即可。其他格式主要用于特殊场景的兼容。
:::

## 下一步

- [基础配置](/config/basic) — 入口、别名、模板、环境变量等
- [开发配置](/config/dev) — 开发服务器、代理、HTTPS
- [构建配置](/config/build) — 生产构建、库构建
- [高级配置](/config/advanced) — 自定义 Loader / Plugin / Babel
