const { CLOUD_ENV } = require('./config/cloud')

App({
  onLaunch() {
    if (!wx.cloud) {
      return wx.showModal({ title: '基础库过低', content: '请使用 2.2.3 以上基础库', showCancel: false })
    }
    wx.cloud.init({
      env: CLOUD_ENV,
      traceUser: true       // 在控制台记录用户访问
    })
    console.log('[cloud] env =', CLOUD_ENV)
  }
})
