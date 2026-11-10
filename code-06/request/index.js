const { InterceptorManager } = require('./interceptor')
const { adapter } = require('./adapter')
const { dedupe } = require('./dedupe')
const { TaskQueue } = require('./queue')
const { BASE_URL, TIMEOUT } = require('../config')

const queue = new TaskQueue(6)

/**
 * TODO-4: 按 axios 的方式组装 Promise 链
 *
 *   chain = [ ...请求拦截器(倒序), adapter, undefined, ...响应拦截器(正序) ]
 *
 * 必答：为什么请求拦截器要 unshift（倒序）、响应拦截器要 push（正序）？
 *       如果都用 push 会怎样？画一张执行顺序图。
 */
function dispatch(config) {
  const chain = [
    cfg => dedupe(cfg, () => queue.push(() => adapter(cfg))),
    undefined
  ]

  // TODO-4: 把两组拦截器接进 chain
  // http.interceptors.request.forEach(h => chain.unshift(h.onFulfilled, h.onRejected))
  // http.interceptors.response.forEach(h => chain.push(h.onFulfilled, h.onRejected))

  let promise = Promise.resolve(config)
  while (chain.length) promise = promise.then(chain.shift(), chain.shift())
  return promise
}

const http = {
  interceptors: {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  },

  request(config) {
    config = Object.assign({ method: 'GET', timeout: TIMEOUT, header: {} }, config)
    config.header = Object.assign({ 'content-type': 'application/json' }, config.header)
    if (!/^https?:/.test(config.url)) config.url = BASE_URL + config.url
    return dispatch(config)
  },

  get(url, data, cfg) { return http.request(Object.assign({}, cfg, { url, data, method: 'GET' })) },
  post(url, data, cfg) { return http.request(Object.assign({}, cfg, { url, data, method: 'POST' })) },
  put(url, data, cfg) { return http.request(Object.assign({}, cfg, { url, data, method: 'PUT' })) },
  del(url, data, cfg) { return http.request(Object.assign({}, cfg, { url, data, method: 'DELETE' })) }
}

module.exports = http
module.exports.queue = queue
