module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false, // 是否启用将ES6模块语法转换为其他模块类型的功能，当前设置为false，以便webpack进行tree shaking。
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
        }
      }
    ],
    ['@babel/preset-react'],
    '@babel/preset-typescript'
  ],
  plugins: [
    // ['import', { libraryName: 'antd', style: 'css' }], // babel-plugin-import: antd的按需加载
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-proposal-decorators', { legacy: true }], // 启用装饰器语法支持
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-json-strings'
  ]
};
