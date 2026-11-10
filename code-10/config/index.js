const ENV = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop'
module.exports = {
  ENV,
  // H5 页面地址。真实项目里必须配在 MP 后台的「业务域名」并放校验文件。
  H5_BASE: 'http://localhost:5173',
  BASE_URL: 'http://localhost:3000'
}
