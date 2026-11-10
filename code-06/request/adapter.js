const { ApiError } = require('./error')

/** 把 wx.request 包成 Promise，并接上 signal 与队列 */
function adapter(config) {
  return new Promise((resolve, reject) => {
    const task = wx.request({
      url: config.url,
      method: config.method,
      data: config.data,
      header: config.header,
      timeout: config.timeout,
      success: res => resolve(Object.assign({}, res, { config })),
      fail: err => {
        const msg = err.errMsg || ''
        const type = msg.indexOf('abort') >= 0 ? 'ABORT'
          : msg.indexOf('timeout') >= 0 ? 'TIMEOUT'
            : 'NETWORK'
        reject(new ApiError({ type, message: msg, config }))
      }
    })

    if (config.signal) config.signal.bind(task)
    if (config.onTask) config.onTask(task)
  })
}

module.exports = { adapter }
