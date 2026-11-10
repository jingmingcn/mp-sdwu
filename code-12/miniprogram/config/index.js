const ENV = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop'

const configs = {
  develop: { BASE_URL: 'https://dev-api.example.com', DEBUG: true },
  trial: { BASE_URL: 'https://uat-api.example.com', DEBUG: true },
  release: { BASE_URL: 'https://api.example.com', DEBUG: false }
}

module.exports = Object.assign({}, configs[ENV] || configs.release, {
  ENV,
  // version.json 由构建脚本生成，含版本号与 commit hash，便于线上定位
  VERSION: '1.0.0'
})
