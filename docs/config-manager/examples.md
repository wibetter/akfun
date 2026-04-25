# 实践示例

本节提供 ConfigManager 在实际项目中的使用示例，帮助你快速上手。

## 示例 1：配置验证与调试

在构建前验证配置，并在调试模式下导出配置快照：

```javascript
const { configManager, validateConfig } = require('akfun')

// 加载配置
configManager.autoLoadConfig()
const config = configManager.mergeConfig()

// 开启调试模式
process.env.AKFUN_DEBUG = 'true'

// 验证配置
try {
  validateConfig(config)
  console.log('✓ 配置验证通过')

  // 导出配置用于调试
  if (process.env.DEBUG_CONFIG) {
    configManager.exportConfig('./debug/config.json')
    console.log('配置已导出到 ./debug/config.json')
  }
} catch (error) {
  console.error('✗ 配置验证失败')
  console.error(error.message)
  process.exit(1)
}
```

## 示例 2：编程式构建

在脚本中以编程方式执行构建，适用于自动化流程：

```javascript
const { build, configManager } = require('akfun')

// 自定义配置
const customConfig = {
  build: {
    assetsRoot: './custom-dist',
    productionSourceMap: false,
    bundleAnalyzerReport: true
  },
  webpack: {
    resolve: {
      alias: {
        '@': './src',
        '@components': './src/components'
      }
    }
  }
}

// 合并配置
configManager.mergeConfig(customConfig)

// 验证配置
configManager.validateConfig()

// 执行构建
build('prod', configManager.getConfig())
```

## 示例 3：多项目批量构建

管理多个子项目的配置，依次执行构建：

```javascript
// scripts/build-all.js
const { build, configManager } = require('akfun')
const path = require('path')

const projects = [
  { name: 'admin', config: './config/admin.config.js' },
  { name: 'mobile', config: './config/mobile.config.js' },
  { name: 'desktop', config: './config/desktop.config.js' }
]

async function buildAll() {
  for (const project of projects) {
    console.log(`\n========== 构建项目: ${project.name} ==========`)

    // 重置配置管理器（清除上一个项目的配置）
    configManager.reset()

    // 加载项目配置
    configManager.loadUserConfig(project.config)
    const config = configManager.mergeConfig()

    // 验证配置
    configManager.validateConfig()

    // 执行构建
    await build('prod', config)

    console.log(`✓ ${project.name} 构建完成`)
  }

  console.log('\n========== 所有项目构建完成 ==========')
}

buildAll().catch(error => {
  console.error('构建失败:', error)
  process.exit(1)
})
```

## 示例 4：动态修改配置

根据运行时条件动态调整配置：

```javascript
const { configManager } = require('akfun')

configManager.autoLoadConfig()
configManager.mergeConfig()

// 根据环境变量调整端口
if (process.env.PORT) {
  configManager.setConfig('dev.port', parseInt(process.env.PORT))
}

// 根据命令行参数开启打包分析
if (process.argv.includes('--analyze')) {
  configManager.setConfig('build.bundleAnalyzerReport', true)
}

// 根据分支名设置不同的输出路径
const branch = process.env.GIT_BRANCH || 'main'
if (branch !== 'main') {
  configManager.setConfig('build.assetsRoot', `./dist-${branch}`)
}

const finalConfig = configManager.getConfig()
console.log('最终配置:', JSON.stringify(finalConfig, null, 2))
```

## 示例 5：配置对比

对比默认配置和用户配置的差异，帮助理解配置的实际效果：

```javascript
const { configManager } = require('akfun')

configManager.autoLoadConfig()

const defaultConfig = configManager.getDefaultConfig()
const userConfig = configManager.getUserConfig()
const mergedConfig = configManager.mergeConfig()

console.log('默认端口:', defaultConfig.dev.port)
console.log('用户配置端口:', userConfig?.dev?.port || '未配置')
console.log('最终端口:', mergedConfig.dev.port)
```
