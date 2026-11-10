/**
 * 错误与埋点上报。
 *
 * 三条硬要求：
 *   1. 批量发送（攒 3 秒或满 20 条），否则埋点会打满 10 个并发额度
 *   2. 失败回填要**限量**，否则队列会像雪球一样越滚越大
 *   3. 上报模块内部**绝不能**再调 report —— 否则失败会触发死循环
 */
const { VERSION, DEBUG } = require('../config')

const MAX_QUEUE = 50
const BATCH = 20
const INTERVAL = 3000
const REPORT_URL = 'https://api.example.com/report'

let queue = []
let timer = null
let sending = false

function context() {
  const pages = getCurrentPages()
  return {
    version: VERSION,
    page: pages.length ? pages[pages.length - 1].route : '',
    sdk: wx.getAppBaseInfo().SDKVersion,
    model: wx.getDeviceInfo().model
  }
}

// TODO-24: 完善批量上报
function report(type, data) {
  queue.push(Object.assign({ type, data, ts: Date.now() }, context()))
  if (DEBUG) console.warn('[report]', type, data)

  if (queue.length >= BATCH) return flush()
  if (!timer) timer = setTimeout(flush, INTERVAL)
}

function flush() {
  clearTimeout(timer)
  timer = null
  if (sending || !queue.length) return

  const batch = queue.splice(0, queue.length)
  sending = true

  wx.request({
    url: REPORT_URL,
    method: 'POST',
    data: { events: batch },
    complete: () => {
      sending = false
    },
    fail: () => {
      // 失败回填，但限量 —— 防止队列雪球
      queue = batch.slice(0, MAX_QUEUE - queue.length).concat(queue)
      // ⚠ 这里绝不能再 report(...)
    }
  })
}

module.exports = { report, flush, __queue: () => queue }
