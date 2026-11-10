const http = require('./index')
const { ApiError } = require('./index')
const { SIGN_KEY } = require('../config')
const { sign } = require('../utils/sign')
const auth = require('../services/auth')

// 注入登录态
http.interceptors.request.use(config => {
  if (!config._skipAuth) {
    const token = auth.getAccess()
    if (token) config.header.Authorization = 'Bearer ' + token
  }
  if (config.needSign) {
    const s = sign(config.data || {}, SIGN_KEY)
    config.header['X-Timestamp'] = String(s.timestamp)
    config.header['X-Nonce'] = s.nonce
    config.header['X-Sign'] = s.sign
  }
  return config
})

// 响应归一
http.interceptors.response.use(res => {
  const { statusCode, data, config } = res
  if (statusCode === 401) return handle401(config)
  if (statusCode < 200 || statusCode >= 300) {
    throw new ApiError({
      type: 'HTTP', statusCode, config,
      message: (data && data.message) || `服务异常(${statusCode})`
    })
  }
  if (data && data.code !== 0) {
    throw new ApiError({ type: 'BIZ', code: data.code, message: data.message, config })
  }
  return data.data
})

let refreshing = null

/**
 * TODO-19: 401 无感续期
 *
 * 要求：
 *   1. config._retried 为真 → 刷新后仍 401，清本地态并跳登录引导页
 *   2. 并发合并：同时来的多个 401 只发起一次 /auth/refresh
 *   3. refresh 也失败 → 降级到 wx.login 重新静默登录
 *   4. 都失败 → 抛错
 *
 * 验证：调 /debug/expire-token 后同时发 6 个 /profile，
 *       服务器日志里 /auth/refresh 只应有 1 条，6 个请求全部成功，
 *       且用户界面上没有任何「请重新登录」的提示。
 */
async function handle401(config) {
  throw new ApiError({ type: 'HTTP', statusCode: 401, message: 'TODO-19 未实现', config })
}

async function refreshTokenOnce() {
  // const refresh = auth.getRefresh()
  // if (refresh) { try { return await doRefresh(refresh) } catch (e) { /* 落到重新 login */ } }
  // return auth.login()
}

async function doRefresh(refreshToken) {
  // return http.post('/auth/refresh', { refreshToken }, { _skipAuth: true, retry: false })
}

module.exports = { handle401, refreshTokenOnce }
