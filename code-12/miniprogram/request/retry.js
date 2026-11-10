/**
 * 指数退避 + 抖动。
 *
 * jitter 是为了避免「惊群」：大量客户端同时失败后，
 * 如果退避时间完全一致，会在同一时刻再次涌向服务器。
 */
function backoff(n, { base = 300, maxDelay = 3000, jitter = 0 } = {}) {
  return Math.min(base * Math.pow(2, n), maxDelay) + jitter
}

/** 只重试幂等请求：POST 下单绝对不能重试，除非后端支持幂等键 */
function isRetryable(err) {
  if (!err) return false
  if (err.type === 'NETWORK' || err.type === 'TIMEOUT') return true
  if (err.type === 'HTTP' && err.statusCode >= 500) return true
  return false
}

module.exports = { backoff, isRetryable }
