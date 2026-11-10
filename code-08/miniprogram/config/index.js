const ENV = typeof __wxConfig !== 'undefined' ? __wxConfig.envVersion : 'develop'
const configs = {
  develop: { BASE_URL: 'http://localhost:3000', DEBUG: true },
  trial:   { BASE_URL: 'http://localhost:3000', DEBUG: true },
  release: { BASE_URL: 'https://api.example.com', DEBUG: false }
}
module.exports = Object.assign({}, configs[ENV] || configs.release, {
  ENV,
  TMPL: {
    PAID: 'tmpl_paid_mock',
    SHIPPED: 'tmpl_shipped_mock',
    ARRIVED: 'tmpl_arrived_mock'
  }
})
