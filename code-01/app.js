const { log, error } = require('./utils/logger')
const { mark } = require('./utils/perf')

mark('app:evaluate') // 代码注入阶段的起点

App({
  globalData: {
    // 只放常量。会变的状态从第五章起交给 Store。
    launchOptions: null
  },

  onLaunch(options) {
    mark('app:onLaunch')
    this.globalData.launchOptions = options
    log('App', 'onLaunch', 'path=' + options.path, 'scene=' + options.scene)
  },

  onShow(options) {
    log('App', 'onShow', 'scene=' + options.scene)
  },

  onHide() {
    log('App', 'onHide')
  },

  onError(stack) {
    error('App', 'onError', stack)
  },

  onPageNotFound(res) {
    log('App', 'onPageNotFound', res.path)
  },

  onUnhandledRejection({ reason }) {
    error('App', 'onUnhandledRejection', reason)
  }
})
