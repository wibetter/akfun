# 高级配置

本节介绍如何扩展 AKFun 内置的 Webpack 配置，包括自定义 Loader、Plugin、Babel 插件以及 CSS / PostCSS 处理。

## 自定义 Loader

通过 `webpack.moduleRules` 添加自定义的 Webpack Loader：

```javascript
module.exports = {
  webpack: {
    moduleRules: [
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader']
      },
      {
        test: /\.csv$/,
        use: ['csv-loader']
      }
    ]
  }
}
```

添加的 Loader 规则会与 AKFun 内置的规则合并，不会覆盖已有规则。

## 自定义 Plugin

通过 `webpack.plugins` 添加自定义的 Webpack Plugin：

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

通过 `webpack.cssLoaderOption` 自定义 CSS Loader 的行为：

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

## 自定义 PostCSS Loader

通过 `webpack.postCssLoaderOption` 自定义 PostCSS 的处理配置，常用于添加 PostCSS 插件：

### px 转 rem

使用 `postcss-pxtorem` 将 `px` 单位自动转换为 `rem`，适用于移动端适配：

```javascript
module.exports = {
  webpack: {
    postCssLoaderOption: {
      postcssOptions: {
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 16,       // 1rem = 16px
            propList: ['*'],     // 所有属性都转换
            minPixelValue: 2     // 小于 2px 的值不转换
          })
        ]
      }
    }
  }
}
```

### px 转 vw

使用 `postcss-px-to-viewport` 将 `px` 转换为 `vw`，实现视口适配：

```javascript
module.exports = {
  webpack: {
    postCssLoaderOption: {
      postcssOptions: {
        plugins: [
          require('postcss-px-to-viewport')({
            viewportWidth: 375,   // 设计稿宽度
            unitPrecision: 5,     // 转换精度
            viewportUnit: 'vw',   // 目标单位
            minPixelValue: 1      // 最小转换值
          })
        ]
      }
    }
  }
}
```

## Externals 配置

通过 `webpack.externals` 将指定依赖排除在打包产物之外，适用于通过 CDN 引入的库：

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

## 构建目标

通过 `webpack.target` 配置构建目标环境：

```javascript
module.exports = {
  webpack: {
    target: ['web', 'es5']  // 默认值：面向浏览器，兼容 ES5
  }
}
```

如果你的项目不需要兼容旧浏览器，可以调整为更高的目标：

```javascript
module.exports = {
  webpack: {
    target: ['web', 'es2015']  // 面向支持 ES2015 的浏览器
  }
}
```
