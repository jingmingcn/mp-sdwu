const { report } = require('./utils/report')
const { initFlags } = require('./services/feature')

App({
  onLaunch() {
    this.ready = initFlags().catch(() => null)

    // TODO-28: 采集 Performance 数据
    // const perf = wx.getPerformance()
    // perf.createObserver(list => { ... }).observe({ entryTypes: [...] })
  },

  // TODO-25: 挂上三个全局钩子
  onError(stack) {
    report('jsError', { stack })
  },

  onUnhandledRejection({ reason }) {
    report('rejection', { msg: String(reason && reason.message ? reason.message : reason) })
  },

  onPageNotFound(res) {
    report('pageNotFound', res)
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
