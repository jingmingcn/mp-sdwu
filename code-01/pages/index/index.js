const { log } = require('../../utils/logger')

/**
 * TODO-8: 逐个执行下列探针，记录「开发者工具」与「真机」的输出差异。
 *
 * 必答：new Date('2026-01-01 10:00:00') 在 iOS 上是什么结果？为什么？
 *       给出一个跨端安全的日期解析写法（提示：utils/format.js 里已有 parseDate）。
 */
const probes = {
  hasWindow: () => typeof window,
  hasDocument: () => typeof document,
  hasXHR: () => typeof XMLHttpRequest,
  dateParse: () => String(new Date('2026-01-01 10:00:00')),
  dateParseISO: () => String(new Date('2026-01-01T10:00:00')),
  dateParseSlash: () => String(new Date('2026/01/01 10:00:00')),
  regexLookbehind: () => {
    try { new RegExp('(?<=a)b'); return 'ok' } catch (e) { return 'fail' }
  },
  optionalChaining: () => {
    try { return String(eval('({a:1})?.a')) } catch (e) { return 'fail' }
  },
  sdkVersion: () => wx.getAppBaseInfo().SDKVersion,
  pixelRatio: () => String(wx.getWindowInfo().pixelRatio),
  system: () => wx.getDeviceInfo().system,
  brand: () => wx.getDeviceInfo().brand + ' / ' + wx.getDeviceInfo().model
}

Component({
  data: { probes: [] },

  methods: {
    onLoad() {
      log('Page[index]', 'onLoad')
    },

    go(e) {
      wx.navigateTo({ url: e.currentTarget.dataset.url })
    },

    runProbes() {
      const result = Object.keys(probes).map(key => {
        let value
        try { value = String(probes[key]()) } catch (err) { value = 'ERR: ' + err.message }
        log('probe', key, '=', value)
        return { key, value }
      })
      this.setData({ probes: result })
    },

    enableDebug() {
      wx.setEnableDebug({ enableDebug: true })
      wx.showToast({ title: '已开启，摇一摇查看', icon: 'none' })
    }
  }
})
