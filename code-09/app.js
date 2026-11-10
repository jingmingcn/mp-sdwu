/**
 * ⚠ 基线版本 —— 故意写差。
 *
 * 问题 2：顶层 require 800KB 城市 JSON，每次冷启动都同步解析
 * 问题 3：onLaunch 里串行 await 四个初始化，共约 1150ms
 */
const cities = require('./config/all-cities.js')     // TODO-5: 改成懒加载
const api = require('./services/api')
const { mark, measure } = require('./utils/perf')

mark('app:evaluate')

App({
  globalData: { cities: null, prefetch: null },

  async onLaunch(options) {
    mark('app:onLaunch')

    // TODO-5: 改造要求
    //   1. 城市数据懒加载（用到时才 require，或改成接口）
    //   2. 首屏必需的（login / config）并行，挂 Promise 供页面 await
    //   3. 非必需的（checkUpdate / initTracker）推到 wx.nextTick
    await api.checkUpdate()        // 300ms
    await api.initTracker()        // 200ms
    await api.login()              // 400ms
    await api.config()             // 250ms

    this.globalData.cities = cities

    // TODO-6: 首屏请求前置 —— 根据启动路径提前发起首页请求
    // if (options.path === 'pages/index/index') {
    //   this.globalData.prefetch = api.feed(1, 20)
    // }

    measure('app:onLaunch 总耗时', 'app:onLaunch')
    measure('app:从注入到 onLaunch 结束', 'app:evaluate')
  }
})
