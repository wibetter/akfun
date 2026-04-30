# 高级配置

本节介绍如何扩展 AKFun 内置的构建配置，包括自定义 Loader、Plugin、Babel 插件以及 CSS / PostCSS 处理。

## 自定义 Loader

通过 `webpack.moduleRules` 添加自定义的 Loader 规则，用于处理 AKFun 默认不支持的文件类型。

每条规则包含匹配条件（`test` 指定文件扩展名）和处理方式（`use` 指定 Loader 列表）。Loader 的执行顺序是从右到左（从下到上），即数组中最后一个 Loader 最先执行。

```javascript
module.exports = {
  webpack: {
    moduleRules: [
      {
        test: /\.md$/,           // 匹配 .md 文件
        use: ['html-loader', 'markdown-loader']  // 先用 markdown-loader 转为 HTML，再用 html-loader 处理
      },
      {
        test: /\.csv$/,
        use: ['csv-loader']      // 将 CSV 文件解析为数组
      }
    ]
  }
}
```

添加的规则会与 AKFun 内置的规则合并，不会覆盖已有规则。

::: tip
你还可以通过 `include` 和 `exclude` 缩小匹配范围，提升构建速度：
```javascript
{
  test: /\.js$/,
  use: ['babel-loader'],
  include: [resolve('src')],     // 只处理 src 目录
  exclude: /node_modules/        // 排除 node_modules
}
```
:::

## 自定义 Plugin

通过 `webpack.plugins` 添加自定义的构建插件，用于在构建的各个阶段执行自定义操作，如文件复制、环境变量注入、HTML 生成等：

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  webpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: 'dist' }
        ]
      })
    ]
  }
}
```

添加的 Plugin 会与 AKFun 内置的 Plugin 合并，不会覆盖已有插件。

## 自定义 Babel 插件

通过 `webpack.babelPlugins` 扩展 Babel 插件，支持**数组形式**和**函数形式**两种写法。

### 数组形式

直接传入 Babel 插件数组，会与内置插件合并：

```javascript
module.exports = {
  webpack: {
    babelPlugins: [
      [
        'component',
        {
          libraryName: 'element-ui',
          styleLibraryName: 'theme-chalk'
        }
      ],
      '@babel/plugin-proposal-optional-chaining'
    ]
  }
}
```

::: tip 典型场景
上面的示例实现了 [Element UI 组件按需引入](https://element.eleme.cn/#/zh-CN/component/quickstart#an-xu-yin-ru)，只打包实际使用的组件，减小产物体积。
:::

### 函数形式

接收当前内置的 Babel 插件数组作为参数，可以进行更灵活的操作（增删改）：

```javascript
module.exports = {
  webpack: {
    babelPlugins: (curBabelPlugins) => {
      // 添加新插件
      curBabelPlugins.push('@babel/plugin-proposal-decorators')

      // 移除某个插件
      const filtered = curBabelPlugins.filter(
        plugin => plugin !== 'some-plugin-to-remove'
      )

      return filtered
    }
  }
}
```

::: warning 注意
函数形式必须返回一个新的插件数组，否则配置不会生效。
:::

## 自定义 CSS Loader

通过 `webpack.cssLoaderOption` 自定义 CSS 的解析行为，控制 `@import` 解析、CSS Modules 等功能：

```javascript
module.exports = {
  webpack: {
    cssLoaderOption: {
      import: false,  // 禁用 @import 解析
      modules: {
        localIdentName: '[name]__[local]--[hash:base64:5]'  // 自定义 CSS Modules 类名格式
      }
    }
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `import` | `boolean` | `true` | 是否解析 CSS 中的 `@import` 语句 |
| `modules` | `boolean \| object` | — | CSS Modules 配置。开启后每个 CSS 文件的类名会被自动加上唯一哈希，避免全局样式冲突。`localIdentName` 控制生成的类名格式 |

::: tip
CSS Modules 适合组件化开发，每个组件的样式天然隔离，无需担心类名冲突。在 Vue 中可以通过 `<style module>` 使用。
:::

## 自定义 PostCSS Loader

通过 `webpack.postCssLoaderOption` 自定义 PostCSS 的处理配置。PostCSS 是一个用 JavaScript 转换 CSS 的工具，通过插件机制可以实现自动添加浏览器前缀、单位转换等功能。

### px 转 rem

使用 `postcss-pxtorem` 将 `px` 单位自动转换为 `rem`，适用于移动端适配。配合 `lib-flexible` 等库动态设置根字体大小，即可实现等比缩放：

```javascript
module.exports = {
  webpack: {
    postCssLoaderOption: {
      postcssOptions: {
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 16,       // 1rem = 16px（通常与设计稿基准一致）
            propList: ['*'],     // 所有属性都转换
            minPixelValue: 2     // 小于 2px 的值不转换（避免边框等细节失真）
          })
        ]
      }
    }
  }
}
```

### px 转 vw

使用 `postcss-px-to-viewport` 将 `px` 转换为 `vw`，实现基于视口宽度的适配，无需额外的 JS 库：

```javascript
module.exports = {
  webpack: {
    postCssLoaderOption: {
      postcssOptions: {
        plugins: [
          require('postcss-px-to-viewport')({
            viewportWidth: 375,   // 设计稿宽度（如 iPhone 6/7/8）
            unitPrecision: 5,     // 转换精度（小数位数）
            viewportUnit: 'vw',   // 目标单位
            minPixelValue: 1      // 最小转换值
          })
        ]
      }
    }
  }
}
```

::: tip
`rem` 方案需要配合 JS 动态设置根字体，`vw` 方案则是纯 CSS 实现，无需额外依赖。两者选其一即可，不建议混用。
:::

## Externals 配置

通过 `webpack.externals` 将指定依赖排除在打包产物之外。被排除的依赖不会被打包进 bundle，而是在运行时从外部环境获取（如通过 CDN 加载的全局变量）。

配置格式为 `{ 模块名: 全局变量名 }`，其中模块名是代码中 `import` 的包名，全局变量名是该库通过 `<script>` 标签加载后在 `window` 上暴露的变量名：

```javascript
module.exports = {
  webpack: {
    externals: {
      vue: 'Vue',
      react: 'React',
      'react-dom': 'ReactDOM',
      jquery: 'jQuery'
    }
  }
}
```

配置后，这些库不会被打包进产物，需要在 HTML 中通过 `<script>` 标签引入：

```html
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js"></script>
<script src="dist/index.js"></script>
```

::: tip
Externals 适合将体积较大且不常变动的库（如 Vue、React、Lodash）通过 CDN 加载，既能减小打包体积，又能利用浏览器缓存加速页面加载。
:::

## 构建目标

通过 `webpack.target` 配置构建的目标运行环境，决定生成代码中可以使用哪些语法特性和 API。

注意 `target` 只影响构建工具生成的运行时代码（如模块加载、chunk 拆分等），不会自动转译你编写的业务代码。如果需要将 ES6+ 语法转为 ES5，仍需通过 Babel 配置。

```javascript
module.exports = {
  webpack: {
    target: ['web', 'es5']  // 默认值：面向浏览器，兼容 ES5
  }
}
```

如果你的项目不需要兼容旧浏览器，可以调整为更高的目标，生成更精简的代码：

```javascript
module.exports = {
  webpack: {
    target: ['web', 'es2015']  // 面向支持 ES2015 的浏览器
  }
}
```

当传入多个目标时，会使用它们的公共特性子集。

**常用目标值：**

| 值 | 说明 |
|------|------|
| `'web'` | 面向浏览器环境（默认） |
| `'node'` | 面向 Node.js 环境 |
| `'es5'` / `'es2015'` / `'es2020'` | 指定 ECMAScript 版本 |
| `'browserslist'` | 从项目的 browserslist 配置自动推断目标环境 |
| `'electron-main'` | 面向 Electron 主进程 |
| `'webworker'` | 面向 WebWorker 环境 |
