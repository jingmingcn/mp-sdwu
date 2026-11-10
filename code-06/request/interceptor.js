/**
 * 拦截器管理器（与 axios 同构）。
 */
class InterceptorManager {
  constructor() {
    this.handlers = []
  }

  // TODO-1: 注册，返回可用于 eject 的 id
  use(onFulfilled, onRejected) {
    return -1
  }

  /**
   * TODO-2: 注销
   * 思考：为什么置 null 而不是 splice？
   *   splice 会让后面所有 handler 的下标前移，之前发出去的 id 全部错位。
   */
  eject(id) {}

  // TODO-3: 遍历（跳过已注销的）
  forEach(fn) {}
}

module.exports = { InterceptorManager }
