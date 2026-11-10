const ENV = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop'
const configs = {
  develop: { BASE_URL: 'http://localhost:3000', DEBUG: true },
  trial:   { BASE_URL: 'http://localhost:3000', DEBUG: true },
  release: { BASE_URL: 'https://api.example.com', DEBUG: false }
}
module.exports = Object.assign({}, configs[ENV] || configs.release, {
  ENV,
  TIMEOUT: 10000,
  // ⚠ 签名密钥放前端必然泄漏（小程序包可反编译）。
  //   它只提高攻击门槛，不能替代服务端的业务校验。
  SIGN_KEY: 'demo-sign-key-not-a-secret'
})
