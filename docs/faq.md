# 常见问题

## 安装相关

### 在 Windows 控制台执行 akfun 相关命令出现报错 {#q-windows-script-error}

如果提示「在此系统上禁止运行脚本」，可能是 Windows 客户端的默认安全策略影响，可尝试在控制台输入以下命令解决：

```bash
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
```

说明：以上命令用于设置允许当前用户在此 Windows 客户端执行所有脚本。[关于 PowerShell 执行策略](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.5)

### 在 Windows 控制台执行 akfun 相关命令时，提示「无法将 akfun 项识别为 cmdlet、函数、脚本文件或可运行程序的名称」 {#q-windows-path-error}
  
该报错是 Windows 上典型的环境变量 PATH 问题，PowerShell 找不到已安装的 CLI 命令所在目录。可按以下三步将 npm 全局路径加入 PATH：

步骤 1：查看 npm 全局安装路径（自动获取）

```bash
$npmPath = npm config get prefix
```

步骤 2：把路径加到当前终端 PATH（立刻生效）

```bash
$env:PATH += ";$npmPath"
```

步骤 3：永久写入用户环境变量（重启后仍有效）

```bash
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$npmPath", "User")
```

说明：出现以上问题时，常见原因是安装 Node 时未勾选安装向导中的相关工具选项（例如「Automatically install the necessary tools…」等）。

### 安装速度慢

**解决方案：** 使用国内镜像源：

```bash
# 临时使用
npm install akfun --registry=https://registry.npmmirror.com

# 永久设置
npm config set registry https://registry.npmmirror.com
```


## 开发相关

### 热更新不生效

**可能原因：**

1. 文件系统监听限制（Linux 系统）
2. 文件路径包含特殊字符
3. 入口文件配置错误

**解决方案：**

- Linux 系统增加文件监听数量：`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
- 确保项目路径不包含中文或特殊字符
- 检查 `webpack.entry` 配置是否正确指向入口文件

### 端口被占用

参考 [调试与排查 - 端口被占用](/config-manager/debugging#端口被占用)。

### 代理请求返回 504

**可能原因：** 目标服务器响应超时。

**解决方案：** 在代理配置中增加超时时间：

```javascript
module.exports = {
  dev: {
    proxyTable: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        timeout: 30000,       // 30 秒超时
        proxyTimeout: 30000
      }
    }
  }
}
```


## 构建相关

### 构建产物体积过大

**排查步骤：**

1. 开启打包分析，查看体积分布：

```javascript
module.exports = {
  build: {
    bundleAnalyzerReport: true
  }
}
```

2. 检查是否有大型依赖可以通过 CDN 引入：

```javascript
module.exports = {
  webpack: {
    externals: {
      vue: 'Vue',
      'element-ui': 'ELEMENT'
    }
  }
}
```

3. 检查是否开启了按需引入（如 Element UI）：

```javascript
module.exports = {
  webpack: {
    babelPlugins: [
      ['component', { libraryName: 'element-ui', styleLibraryName: 'theme-chalk' }]
    ]
  }
}
```

### 构建时内存溢出

**现象：** `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`

**解决方案：** 增加 Node.js 内存限制：

```json
{
  "scripts": {
    "build": "node --max-old-space-size=4096 node_modules/.bin/akfun build"
  }
}
```

### ESM 构建中 SVG 被转为 base64

**原因：** `@rollup/plugin-image` 默认会将图片转为 base64。

**解决方案：** 通过 `svgDir` 配置排除 SVG 图标目录：

```javascript
module.exports = {
  build2esm: {
    input: './src/main.js',
    fileName: 'index',
    svgDir: 'src/icons/**'  // 该目录下的 SVG 不会被转为 base64
  }
}
```


## 样式相关

### Sass 变量在组件中无法使用

**原因：** 未配置公共 Sass 资源注入。

**解决方案：**

```javascript
const path = require('path')
const resolve = (dir) => path.resolve(__dirname, dir)

module.exports = {
  webpack: {
    sassResources: [
      resolve('src/assets/css/variables.scss'),
      resolve('src/assets/css/mixin.scss')
    ]
  }
}
```

### PostCSS 插件不生效

**排查步骤：**

1. 确认插件已安装：`npm ls postcss-pxtorem`
2. 检查配置格式是否正确（注意 `postcssOptions` 层级）：

```javascript
// ✅ 正确
postCssLoaderOption: {
  postcssOptions: {
    plugins: [require('postcss-pxtorem')({ rootValue: 16 })]
  }
}

// ❌ 错误（缺少 postcssOptions 层级）
postCssLoaderOption: {
  plugins: [require('postcss-pxtorem')({ rootValue: 16 })]
}
```


## TypeScript 相关

### 声明文件未生成

**排查步骤：**

1. 确认已开启声明文件生成：

```javascript
module.exports = {
  webpack: {
    createDeclaration: true
  }
}
```

2. 确认项目中存在 `tsconfig.json` 文件
3. 检查 `tsconfig.json` 中的 `declaration` 选项是否为 `true`
