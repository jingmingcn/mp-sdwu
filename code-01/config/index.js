/**
 * 环境配置。
 *
 * 规则：用 __wxConfig.envVersion 自动判断，绝不靠手动改常量。
 *   develop —— 开发者工具 / 真机预览
 *   trial   —— 体验版
 *   release —— 正式版
 */
const ENV = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop'

const configs = {
  develop: {
    BASE_URL: 'https://dev-api.example.com',
    DEBUG: true
  },
  // TODO-1: 补全 trial 配置
  // 提示：体验版通常指向 UAT 环境，DEBUG 仍为 true
  trial: {},

  // TODO-1: 补全 release 配置
  // 要求：DEBUG 必须为 false
  release: {}
}

module.exports = Object.assign({}, configs[ENV] || configs.release, {
  ENV,
  VERSION: '1.0.0'
})
