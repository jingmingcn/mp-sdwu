/**
 * 精简版请求库（实验六的成品）。
 * 本实验专注于鉴权，所以这里给出可直接使用的实现。
 */
const { BASE_URL, TIMEOUT } = require('../config')

class ApiError extends Error {
  constructor({ type, message, code, statusCode, config }) {
    super(message || '请求失败')
    this.name = 'ApiError'
    this.type = type
    this.code = code
    this.statusCode = statusCode
    this.config = config
    this.url = config && config.url
  }
  get userMessage() {
    if (this.type === 'NETWORK') return '网络不给力，请检查后重试'
    if (this.type === 'TIMEOUT') return '请求超时，请重试'
    if (this.type === 'HTTP') return '服务暂时不可用'
    return this.message
  }
}

const requestInterceptors = []
const responseInterceptors = []

function adapter(config) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.url,
      method: config.method,
      data: config.data,
      header: config.header,
      timeout: config.timeout,
      success: res => resolve(Object.assign({}, res, { config })),
      fail: err => {
        const msg = err.errMsg || ''
        const type = msg.indexOf('timeout') >= 0 ? 'TIMEOUT' : 'NETWORK'
        reject(new ApiError({ type, message: msg, config }))
      }
    })
  })
}

function dispatch(config) {
  const chain = [adapter, undefined]
  requestInterceptors.forEach(h => chain.unshift(h.onFulfilled, h.onRejected))
  responseInterceptors.forEach(h => chain.push(h.onFulfilled, h.onRejected))
  let p = Promise.resolve(config)
  while (chain.length) p = p.then(chain.shift(), chain.shift())
  return p
}

const http = {
  interceptors: {
    request: { use: (a, b) => requestInterceptors.push({ onFulfilled: a, onRejected: b }) },
    response: { use: (a, b) => responseInterceptors.push({ onFulfilled: a, onRejected: b }) }
  },
  request(config) {
    config = Object.assign({ method: 'GET', timeout: TIMEOUT, header: {} }, config)
    config.header = Object.assign({ 'content-type': 'application/json' }, config.header)
    if (!/^https?:/.test(config.url)) config.url = BASE_URL + config.url
    return dispatch(config)
  },
  get: (url, data, cfg) => http.request(Object.assign({}, cfg, { url, data, method: 'GET' })),
  post: (url, data, cfg) => http.request(Object.assign({}, cfg, { url, data, method: 'POST' }))
}

module.exports = http
module.exports.ApiError = ApiError
