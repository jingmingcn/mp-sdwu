/**
 * 取消令牌（AbortSignal 风格）。
 *
 * 用法：
 *   const signal = new RequestSignal()
 *   http.get('/list', {}, { signal })
 *   signal.abort()   // 取消该 signal 下的所有在途请求
 */
class RequestSignal {
  constructor() {
    this.tasks = new Set()
    this.aborted = false
  }

  // TODO-18: 若已 aborted 则立即 abort 新 task，否则收集起来
  bind(task) {}

  // TODO-19: 取消全部在途任务
  abort() {}
}

module.exports = { RequestSignal }
