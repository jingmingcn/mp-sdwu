/**
 * 统一错误对象。
 *
 * 三层错误：
 *   NETWORK / TIMEOUT / ABORT —— wx.request 的 fail 回调
 *   HTTP                      —— success 但 statusCode 非 2xx
 *   BIZ                       —— HTTP 200 但 data.code !== 0
 */
class ApiError extends Error {
  constructor({ type, message, code, statusCode, config }) {
    super(message || '请求失败')
    this.name = 'ApiError'
    this.type = type
    // TODO-8: 补全其余字段（code / statusCode / url / config）
  }

  /**
   * TODO-9: 是否可重试
   *   NETWORK / TIMEOUT / HTTP 5xx → true
   *   HTTP 4xx / BIZ / ABORT       → false
   */
  get isRetryable() {
    return false
  }

  /**
   * TODO-10: 给用户看的文案
   *   NETWORK → '网络不给力，请检查后重试'
   *   TIMEOUT → '请求超时，请重试'
   *   HTTP    → '服务暂时不可用'
   *   BIZ     → 用后端的 message（this.message）
   */
  get userMessage() {
    return this.message
  }
}

module.exports = { ApiError }
