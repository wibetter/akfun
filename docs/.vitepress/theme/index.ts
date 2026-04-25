import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CaseShowcase from './components/CaseShowcase.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CaseShowcase', CaseShowcase)
  },
} satisfies Theme
