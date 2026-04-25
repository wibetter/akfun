# 多页面与模板

AKFun 支持多页面应用（MPA）的开发与构建，本节介绍多页面模式的配置方式和模板机制。

## 多页面入口

### 手动配置多入口

在 `webpack.entry` 中配置多个入口文件：

```javascript
module.exports = {
  webpack: {
    entry: {
      index: './src/pages/index/main.js',
      about: './src/pages/about/main.js',
      contact: './src/pages/contact/main.js'
    }
  }
}
```

### 自动扫描入口

当 `entry` 仅配置了一个入口且对应文件不存在时，AKFun 会自动从 `src/pages` 目录扫描入口文件。

**扫描规则：**

- 扫描 `src/pages` 目录下以 `.ts`、`.tsx`、`.js`、`.jsx` 结尾的文件
- 匹配正则：`/\.[tj]sx?$/`
- 每个匹配的文件作为一个独立的入口

**目录结构示例：**

```
src/
└── pages/
    ├── index/
    │   ├── main.js      ← 自动识别为入口
    │   └── index.html   ← 自动匹配为模板
    ├── about/
    │   ├── main.js      ← 自动识别为入口
    │   └── index.html   ← 自动匹配为模板
    └── contact/
        └── main.tsx     ← 自动识别为入口（使用默认模板）
```

## 模板机制

### 模板优先级

AKFun 按以下优先级查找页面模板：

1. **项目根目录模板** — 优先使用 `./src/index.html`
2. **内置默认模板** — 如果 `./src/index.html` 不存在，使用 AKFun 内置的默认模板
3. **多页面同名模板** — 在多页面模式下，如果 `pages` 目录下存在与入口同名的 HTML 文件，将其作为该页面的模板

### 自定义模板

通过 `webpack.template` 指定全局自定义模板：

```javascript
module.exports = {
  webpack: {
    template: './src/custom-template.html'
  }
}
```

### 模板示例

一个典型的页面模板：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
  <div id="app"></div>
  <!-- Webpack 会自动注入打包后的 JS 和 CSS -->
</body>
</html>
```

## 使用范围

| 构建命令 | 是否使用模板 | 说明 |
|---------|------------|------|
| `akfun dev` | ✅ 是 | 开发模式使用模板生成页面 |
| `akfun build` | ✅ 是 | 生产构建使用模板生成页面 |
| `akfun build2lib` | ❌ 否 | 库构建不向页面注入打包产物 |
| `akfun build2esm` | ❌ 否 | ESM 构建不涉及页面模板 |
| `akfun build2node` | ❌ 否 | Node 模块构建不涉及页面模板 |

::: tip
`build2lib`、`build2esm`、`build2node` 构建的是库或模块，不需要 HTML 页面模板。
:::
