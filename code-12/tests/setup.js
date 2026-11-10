/**
 * setupFiles —— 在测试框架安装之前执行，只能挂全局变量。
 * （beforeEach 之类的钩子要放 setup-after-env.js）
 */
global.wx = require('./mocks/wx')
global.__wxConfig = { envVersion: 'develop' }
