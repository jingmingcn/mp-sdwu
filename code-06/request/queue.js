/**
 * 并发队列。
 *
 * 微信的 wx.request 并发上限是 10（含 upload/download）。
 * 超出后请求进入队列，表现为「随机的、无规律的慢」。
 * 自己限流到 6，留 4 个额度给上传与图片。
 */
class TaskQueue {
  constructor(limit = 6) {
    this.limit = limit
    this.running = 0
    this.queue = []
  }

  // TODO-14: push 返回 Promise，内部排队
  push(taskFn) {
    return Promise.resolve()
  }

  // TODO-15: 取出任务执行，完成后递归调度下一个
  _next() {}
}

module.exports = { TaskQueue }
