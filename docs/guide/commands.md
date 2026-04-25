# 命令说明

AKFun 提供了一组 CLI 命令，覆盖项目创建、本地开发、生产构建、库构建等常见场景。

## 命令一览

| 命令 | 说明 |
|------|------|
| `akfun init` | 交互式创建新项目 |
| `akfun config init` | 生成配置文件 |
| `akfun dev` | 启动本地开发服务器 |
| `akfun build` | 生产环境构建 |
| `akfun build2lib` | 构建 UMD 格式的库 |
| `akfun build2esm` | 构建 ESM 格式的库 |
| `akfun build2node` | 构建 Node 模块 |


## akfun init

交互式创建新项目，支持选择不同的项目模板。

```bash
akfun init [options]
```

**参数说明：**

| 参数 | 说明 | 示例 |
|------|------|------|
| `-t` | 指定项目模板类型（`vue` / `react`） | `akfun init -t=vue` |
| `--dir` | 指定项目目录名称 | `akfun init --dir=my-app` |

**使用示例：**

```bash
# 交互式创建（会提示选择模板）
akfun init

# 直接指定模板和目录
akfun init -t=vue --dir=my-vue-app

# 创建 React 项目
akfun init -t=react
```

## akfun config init

在当前项目根目录生成 `akfun.config.js` 配置文件。该文件包含默认配置，你可以根据项目需要进行修改。

```bash
akfun config init
```

::: tip
如果项目根目录已存在 `akfun.config.js`，该命令不会覆盖已有文件。
:::


## akfun dev

启动本地开发服务器，提供以下能力：

- **热模块替换（HMR）** — 修改代码后自动更新页面，无需手动刷新
- **接口代理** — 通过 `proxyTable` 配置将 API 请求代理到后端服务
- **HTTPS 支持** — 可选开启本地 HTTPS 开发服务
- **代码检查** — 可选开启 ESLint / StyleLint 实时检查

```bash
akfun dev
```

开发服务器的详细配置请参考 [开发配置](/config/dev)。

## akfun build

执行生产环境构建，输出经过压缩优化的静态资源文件。

```bash
akfun build
```

**构建特性：**

- 代码压缩与混淆（UglifyJS）
- 可选 Source Map 生成
- 可选 Gzip 压缩
- 可选打包分析报告

构建的详细配置请参考 [构建配置](/config/build)。


## akfun build2lib

将项目构建为 **UMD 格式**的库文件，适用于以下引入方式：

- 通过 `<script>` 标签直接引入
- 通过 CommonJS（`require`）引入
- 通过 AMD（`define`）引入

```bash
akfun build2lib
```

构建完成后，产物默认输出到 `dist/` 目录。详细配置请参考 [构建配置 - UMD 库构建](/config/build#umd-库构建-build2lib)。

## akfun build2esm

将项目构建为 **ESM（ES Module）格式**的库文件，适用于现代模块系统。基于 Rollup 构建，产物支持 Tree Shaking。

```bash
akfun build2esm
```

详细配置请参考 [构建配置 - ESM 库构建](/config/build#esm-库构建-build2esm)。


## akfun build2node

将项目构建为 **Node 模块**，通常用于构建 Node CLI 工具或服务端脚本。基于 Rollup 构建。

```bash
akfun build2node
```

详细配置请参考 [构建配置 - Node 模块构建](/config/build#node-模块构建-build2node)。


## 在 npm scripts 中使用

推荐在 `package.json` 中配置 scripts，方便团队统一使用：

```json
{
  "scripts": {
    "dev": "akfun dev",
    "build": "akfun build",
    "build:lib": "akfun build2lib",
    "build:esm": "akfun build2esm",
    "build:node": "akfun build2node"
  }
}
```

然后通过 `npm run` 或 `yarn` 执行：

```bash
npm run dev
npm run build
```
