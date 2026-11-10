/**
 * 拦截器注册。
 * 在 app.js 里 require 一次即可。
 */
const http = require('./index')
const { ApiError } = require('./error')
const { backoff, sleep } = require('./retry')

// ── TODO-5: 注入 token 与 X-Request-Id ──
http.interceptors.request.use(config => {
  // const token = wx.getStorageSync('auth:token')
  // if (token && !config._skipAuth) config.header.Authorization = 'Bearer ' + token
  // config.header['X-Request-Id'] = ...
  return config
})

// ── TODO-6: 统一 loading（计数器，防止并发时闪烁）──
let pending = 0
http.interceptors.request.use(config => {
  // if (config.loading !== false && pending++ === 0) wx.showLoading({ mask: true })
  return config
})
const doneLoading = () => {
  // if (--pending <= 0) { pending = 0; wx.hideLoading() }
}
http.interceptors.response.use(
  res => { doneLoading(); return res },
  err => { doneLoading(); return Promise.reject(err) }
)

// ── TODO-7: 响应归一 ──
http.interceptors.response.use(res => {
  const { statusCode, data, config } = res

  // if (statusCode === 401) return handle401(config)
  // if (statusCode < 200 || statusCode >= 300) throw new ApiError({ type: 'HTTP', ... })
  // if (data && data.code !== 0) throw new ApiError({ type: 'BIZ', ... })
  // return data.data      // 业务代码直接拿到 data，不用层层解包

  return data
})

// ── TODO-11: 指数退避重试 ──
http.interceptors.response.use(null, async err => {
  const config = err.config
  if (!config || config.retry === false) throw err
  // if (!err.isRetryable) throw err
  // config._retryCount = (config._retryCount || 0) + 1
  // if (config._retryCount > (config.retry === undefined ? 2 : config.retry)) throw err
  // console.log(`[retry] 第 ${config._retryCount} 次失败，${delay}ms 后重试`)
  // await sleep(backoff(config._retryCount - 1))
  // return http.request(config)
  throw err
})

// ── TODO-12 / TODO-13: 401 刷新与并发合并 ──
let refreshing = null

async function handle401(config) {
  // 1. config._retried 为真 → 刷新后仍 401，跳登录并抛错
  // 2. 若无正在进行的刷新，发起一次；否则复用同一个 Promise
  // 3. 刷新完成后用新 token 重放原请求
}

async function doRefresh() {
  // const { code } = await wxLogin()
  // const { token } = await http.post('/auth/login', { code }, { _skipAuth: true, retry: false })
  // wx.setStorageSync('auth:token', token)
}

function wxLogin() {
  return new Promise((resolve, reject) => wx.login({ success: resolve, fail: reject }))
}

module.exports = { handle401, doRefresh }
