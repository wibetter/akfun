import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
// github部署地址：https://wibetter.github.io/akfun/html
// netlify 部署地址：/
const base = '/'

export default defineConfig({
  base,
  outDir: '../html',
  assetsDir: './assets',
  title: 'AKFun 使用手册',
  description:
    'AKFun 前端脚手架使用手册，涵盖安装、命令说明、配置指南与高级用法等完整说明',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/x-icon',
        // head 中的 href 不会自动加 base，需与上面 base 保持一致
        href: `${base}img/favicon.ico`,
      },
    ],
    // 百度统计：public/js/tongji.js，构建后每个 HTML 页面 head 中都会引入
    ['script', { src: `${base}js/tongji.js` }],
  ],
  themeConfig: {
    logo: '/img/akfun-logo.svg',
    search: {
      provider: 'local',
    },
    nav: [
      { text: '首页', link: '/' },
      {
        text: '指南',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '命令说明', link: '/guide/commands' },
        ],
      },
      {
        text: '配置',
        items: [
          { text: '基础配置', link: '/config/basic' },
          { text: '开发配置', link: '/config/dev' },
          { text: '构建配置', link: '/config/build' },
          { text: '高级配置', link: '/config/advanced' },
        ],
      },
      { text: '使用案例', link: '/cases' },
      {
        text: '相关链接',
        items: [
          { text: 'Webpack 文档', link: 'https://webpack.js.org/' },
          { text: 'Rollup 文档', link: 'https://rollupjs.org/' },
          { text: 'params-replace-loader', link: 'https://www.npmjs.com/package/params-replace-loader' },
          { text: 'NPM', link: 'https://www.npmjs.com/package/akfun' },
        ],
      },
    ],
    sidebar: [
      {
        text: '入门指南',
        items: [
          { text: '简介', link: '/guide/introduction' },
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '命令说明', link: '/guide/commands' },
        ],
      },
      {
        text: '配置指南',
        items: [
          { text: '配置文件说明', link: '/config/overview' },
          { text: '基础配置', link: '/config/basic' },
          { text: '开发配置', link: '/config/dev' },
          { text: '构建配置', link: '/config/build' },
          { text: '高级配置', link: '/config/advanced' },
        ],
      },
      {
        text: '配置管理（v5.2.0+）',
        items: [
          { text: '概述', link: '/config-manager/overview' },
          { text: 'ConfigManager API', link: '/config-manager/api' },
          { text: '配置验证', link: '/config-manager/validation' },
          { text: '实践示例', link: '/config-manager/examples' },
          { text: '调试与排查', link: '/config-manager/debugging' },
        ],
      },
      {
        text: '更多',
        items: [
          { text: '多页面与模板', link: '/advanced/multi-page' },
          { text: '使用案例', link: '/cases' },
          { text: '常见问题', link: '/faq' },
        ],
      },
    ],
    outline: {
      label: '快速导航',
      level: [2, 3],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wibetter/akfun' },
    ],
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © AKFun',
    },
  },
})
