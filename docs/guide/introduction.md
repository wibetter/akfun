# 简介

AKFun 是一个基于 **Webpack** 与 **Rollup** 的多场景前端打包工具，支持 Vue、React、React + TypeScript 技术栈，致力于提供"零配置、开箱即用"的前端工程能力，让开发者专注于业务开发。

## 主要特性

- **零配置** — 内置前端工程最佳实践的默认配置，安装后即可使用，无需繁琐的初始化步骤。
- **多技术栈支持** — 同时支持 Vue、React、React + TypeScript 的本地调试与生产构建。
- **多种构建模式** — 涵盖本地开发（含热更新 / 接口代理）、生产构建、UMD 库构建、ESM 库构建、Node 模块构建等场景。
- **灵活可配** — 支持自定义入口、路径别名、接口代理、公共样式注入、ESLint / StyleLint、Babel / Loader / Plugin 扩展等配置项。
- **样式与规范集成** — 内置 Autoprefixer、Sass、PostCSS、ESLint、StyleLint，帮助团队统一代码风格。
- **环境变量替换** — 基于 [params-replace-loader](https://www.npmjs.com/package/params-replace-loader) 实现多环境参数批量替换。
- **项目模板** — 提供完整的 Vue / React 项目模板，一键创建新项目。
- **内置缓存机制** — 利用缓存加速二次构建，提升开发效率。

## 技术架构

AKFun 在不同构建场景下使用不同的底层工具：

| 构建场景 | 底层工具 | 说明 |
|---------|---------|------|
| 本地开发 (`dev`) | Webpack | 提供 DevServer、热更新、接口代理等能力 |
| 生产构建 (`build`) | Webpack | 代码压缩、分包优化、Source Map 等 |
| UMD 库构建 (`build2lib`) | Webpack | 输出 UMD 格式，可通过 `<script>` 标签引入 |
| ESM 库构建 (`build2esm`) | Rollup | 输出 ESM 格式，适用于现代模块系统 |
| Node 模块构建 (`build2node`) | Rollup | 输出 Node 模块，适用于 CLI 工具等场景 |

## 适用场景

- 需要快速启动一个 Vue / React 项目，不想花时间配置 Webpack
- 团队需要统一的前端工程化方案
- 需要将组件或工具库打包为 UMD / ESM 格式发布到 npm
- 需要构建 Node CLI 工具

## 下一步

- [安装 AKFun](/guide/installation) — 了解如何安装
- [快速开始](/guide/quick-start) — 5 分钟上手
- [命令说明](/guide/commands) — 查看所有可用命令
