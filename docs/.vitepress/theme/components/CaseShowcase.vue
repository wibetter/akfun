<script setup lang="ts">
/**
 * AKFun 使用案例展示组件
 * 参照 neo-cmp-docs 的案例展示方式，以卡片形式展示使用 AKFun 的项目
 */

interface CaseItem {
  title: string
  desc: string
  usage: string
  repo: string
  link?: string
  tags: string[]
}

const cases: CaseItem[] = [
  {
    title: 'JSONEditor',
    desc: '提供 JSON 与 JSON Schema 的可视化编辑能力，内置 JSONEditor、SchemaEditor，可通过表单化界面维护 schema 和 json 数据，可用于低代码平台的属性配置面板。使用 AKFun 进行本地开发调试与生产构建。',
    usage: 'npm install akfun --save-dev',
    repo: 'https://github.com/wibetter/json-editor',
    link: 'https://wibetter.github.io/json-editor/online-demo/7.0.0/index.html',
    tags: ['JSONEditor', 'React', 'Low-Code'],
  },
  {
    title: 'amis-editor-demo',
    desc: '百度 amis 可视化编辑器的示例项目，基于 amis-editor 实现页面可视化搭建能力，支持拖拽组件、属性配置、实时预览等功能。使用 AKFun 作为前端构建工具。',
    usage: 'npm install akfun --save-dev',
    repo: 'https://github.com/aisuda/amis-editor-demo',
    link: 'https://aisuda.github.io/amis-editor-demo/',
    tags: ['amis', 'React', 'Low-Code'],
  },
  {
    title: 'neo-cmp-cli',
    desc: '面向 Neo 平台的自定义组件开发工具，基于 AKFun 的工程能力，提供项目初始化、编译构建、本地预览与热更新、多技术栈支持以及发布到 NeoCRM 等能力。',
    usage: 'npm install akfun --save-dev',
    link: 'https://neo-cmp-docs.netlify.app/',
    tags: ['CLI', '自定义组件开发工具'],
  },
  {
    title: 'neo-open-api',
    desc: '开放 API 服务模块，提供标准化的接口封装与数据交互能力，支持平台实体数据源的查询与写入操作。使用 AKFun 的 build2lib / build2esm 模式构建 NPM 包。',
    usage: 'npm install akfun --save-dev',
    repo: 'https://github.com/wibetter/neo-open-api',
    tags: ['TypeScript', 'API', 'NPM Package'],
  },
  {
    title: 'pigNews 小猪新闻（H5版）',
    desc: '滚动资讯，高清图集，视频集锦。使用 AKFun 进行本地开发调试与生产构建。',
    usage: 'npm install akfun --save-dev',
    repo: 'https://github.com/wibetter/pigNews',
    link: 'https://wibetter.github.io/pigNews/#/photos/',
    tags: ['Vue', 'H5', 'News'],
  },
]
</script>

<template>
  <div class="case-showcase">
    <div class="case-grid">
      <div
        v-for="(item, index) in cases"
        :key="index"
        class="case-item"
      >
        <h3 class="case-card__title">{{ item.title }}</h3>
        <div class="case-card">
          <div class="case-card__header">
            <div class="case-card__tags">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="case-card__tag"
              >{{ tag }}</span>
            </div>
          </div>

          <div class="case-card__body">
            <p class="case-card__desc">{{ item.desc }}</p>
          </div>

          <div class="case-card__usage">
            <span class="case-card__usage-label">使用方式</span>
            <code class="case-card__usage-code">{{ item.usage }}</code>
          </div>

          <div class="case-card__footer">
            <a
              v-if="item.repo"
              class="case-card__link case-card__link--repo"
              :href="item.repo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="case-card__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
            <a
              v-if="item.link"
              class="case-card__link case-card__link--demo"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="case-card__icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4.5 2A2.5 2.5 0 002 4.5v7A2.5 2.5 0 004.5 14h7a2.5 2.5 0 002.5-2.5v-3a.5.5 0 00-1 0v3a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 013 11.5v-7A1.5 1.5 0 014.5 3h3a.5.5 0 000-1h-3zM9 2.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v4a.5.5 0 01-1 0V3.707l-5.146 5.147a.5.5 0 01-.708-.708L12.293 3H9.5a.5.5 0 01-.5-.5z"/>
              </svg>
              在线演示
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.case-showcase {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* ---- 外层容器（标题 + 卡片） ---- */
.case-item {
  display: flex;
  flex-direction: column;
}

/* ---- 卡片 ---- */
.case-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 50%, var(--vp-c-bg));
  transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
}

.case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

html.dark .case-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

/* 头部 */
.case-card__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px 0;
}

.case-card__title {
  margin: 0 0 8px;
  padding: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

.case-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.case-card__tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-radius: 12px;
}

/* 正文 */
.case-card__body {
  flex: 1;
  padding: 12px 20px;
}

.case-card__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* 使用方式 */
.case-card__usage {
  padding: 0 20px 16px;
}

.case-card__usage-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}

.case-card__usage-code {
  display: block;
  margin: 0;
  padding: 8px 12px;
  font-size: 12.5px;
  line-height: 1.5;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  word-break: break-word;
}

/* 底部链接 */
.case-card__footer {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
}

.case-card__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.case-card__link--repo {
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
}

.case-card__link--repo:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-text-3);
}

.case-card__link--demo {
  color: #fff;
  background: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.case-card__link--demo:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}

.case-card__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ---- 响应式 ---- */
@media (max-width: 640px) {
  .case-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
