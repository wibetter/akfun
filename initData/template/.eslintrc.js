const { curWebpackBaseConfPath } = require('akfun');

module.exports = {
  root: true,
  // 此项是用来指定eslint解析器的，解析器必须符合规则，
  parser: 'vue-eslint-parser',
  // 此项是用来指定javaScript语言类型和风格，sourceType用来指定js导入的方式，默认是script，此处设置为module，指某块导入方式
  parserOptions: {
    parser: 'babel-eslint', // babel-eslint解析器是对babel解析器的包装使其与ESLint解析
    ecmaVersion: 6,
    sourceType: 'module', // 支持的ES语法版本，默认为5。注意只是语法，不包括ES的全局变量
    ecmaFeatures: {
      // Features是特征的意思，这里用于指定要使用其他那些语言对象
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    node: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  // 此项是用来配置标准的js风格，就是说写代码的时候要规范的写，如果你使用vs-code我觉得应该可以避免出错
  extends: [
    /** vue 的额外添加的规则是 v-if, v-else 等指令检测 */
    'plugin:vue/essential', // 额外添加的规则可查看 https://vuejs.github.io/eslint-plugin-vue/rules/
    'airbnb-base', // eslint-config-airbnb-base/**
  ],
  // 此项是用来提供插件的，插件名称省略了eslint-plugin-，下面这个配置是用来规范html的
  // required to lint *.src files
  plugins: ['prettier', 'html', 'react'],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: curWebpackBaseConfPath,
      },
    },
  },
  // 添加自定义ESLint规则
  // "off" or 0 关闭规则
  // "warn" or 1 将规则视为一个警告（不会影响退出码）
  // "error" or 2 将规则视为一个错误 (退出码为1)
  // ESLint自定义规则：http://eslint.cn/docs/rules/
  rules: {
    "prettier/prettier": 0, // Runs Prettier as an ESLint rule and reports differences as individual ESLint issues.
    // don't require .vue extension when importing
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'never',
      },
    ],
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'import/first': 0,
    'arrow-parens': 0,
    'no-underscore-dangle': 'off',
    // allow debugger during development
    'no-debugger': 1,
    'linebreak-style': 'off',
    'no-alert': 1, // 是否禁止使用alert confirm prompt
    'no-console': 1, // 是否禁止使用console，0表示关闭
    'consistent-return': 0, // return 后面是否允许省略
    'comma-dangle': 0, // 允许末尾有逗号
    'no-use-before-define': 1, // 兼容函数本身调用自己的情况
    'no-plusplus': 0, // 允许使用 i++
    'prefer-object-spread ': 0,
    'import/newline-after-import': 0,
    'no-unreachable': 0,
    'import/prefer-default-export': 0, // 不强制使用default-export
    'array-callback-return': 0,
    'camelcase': 1, // 双峰驼命名格式
    'no-shadow': 0, // 外部作用域中的变量不能与它所包含的作用域中的变量或参数同名
    'prefer-destructuring': 0, // 该规则强制执行解构操作，而不是通过成员表达式访问属性。
    'quotes': [1, 'single'], // 引号类型 `` "" ''
    'quote-props': 1, // 对象字面量中的属性名是否强制双引号
    'import/no-cycle': 0, // 循环依赖
    'no-lonely-if': 0, // 禁止else语句内只有if语句
    'no-eval': 1, // JavaScript的eval()功能具有潜在的危险，并且经常被滥用
    'object-curly-newline': 0, // 该规则在对象文字括号或销毁分配中强制使用一致的换行符
    'operator-linebreak': [0, 'before'], // 换行时运算符在行尾还是行首
  },
};
