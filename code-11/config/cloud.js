/**
 * 云环境配置。
 *
 * TODO-24: 按 envVersion 自动切换云环境。
 *
 * 必答：为什么不能把环境 ID 写死？
 *   （开发版误写生产数据、体验版与正式版数据混在一起…）
 */
const ENV_MAP = {
  develop: 'dev-xxxxxx',
  trial: 'dev-xxxxxx',
  release: 'prod-xxxxxx'
}

const envVersion = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop'

module.exports = {
  CLOUD_ENV: ENV_MAP[envVersion] || ENV_MAP.release,
  envVersion,
  ENV_MAP
}
