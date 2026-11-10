/**
 * 指数退避重试。
 *
 *   delay(n) = min(base * 2^n, maxDelay) + jitter
 *
 * jitter（抖动）是为了避免「惊群」：
 * 大量客户端同时失败后，如果退避时间完全一致，会在同一时刻再次涌向服务器。
 */
function backoff(n, { base = 300, maxDelay = 3000 } = {}) {
  return Math.min(base * Math.pow(2, n), maxDelay) + Math.random() * 100
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

/** 独立使用的重试包装（也可以只用拦截器版本） */
async function withRetry(fn, { retries = 2, base = 300, maxDelay = 3000 } = {}) {
  let lastErr
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (!e.isRetryable || i === retries) throw e
      await sleep(backoff(i, { base, maxDelay }))
    }
  }
  throw lastErr
}

module.exports = { withRetry, backoff, sleep }
