/**
 * TODO-1: 补全配置。
 *
 * 提示：小程序的全局变量必须显式声明，否则全是 no-undef 报错。
 */
module.exports = {
  root: true,
  env: { es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'script' },

  globals: {
    // TODO-1: 声明小程序全局变量
    //
    // 为什么必须显式声明：小程序逻辑层不是 Node 也不是浏览器，
    // 它只提供 ECMAScript 标准能力 + 这里列出的这些。
    // 用 env: node 会把 process / fs 也放进来 —— 那是在骗自己。
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    Behavior: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    requirePlugin: 'readonly',
    __wxConfig: 'readonly',

    // 逻辑层提供的模块系统与定时器（注意：没有 window / document）
    module: 'writable',
    exports: 'writable',
    require: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    Promise: 'readonly'
  },

  extends: ['eslint:recommended'],

  rules: {
    // TODO-1: 至少配置 5 条对本项目有意义的规则，并在报告里说明理由
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error'
  },

  overrides: [
    { files: ['tests/**/*.js'], env: { jest: true, node: true, browser: true } },
    { files: ['scripts/**/*.js'], env: { node: true }, rules: { 'no-console': 'off' } }
  ],

  ignorePatterns: ['node_modules/', 'miniprogram/miniprogram_npm/', 'dist/', 'tests/fixtures/']
}
