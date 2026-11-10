/**
 * 业务数据访问。
 * 依赖 wx.request —— 所以测它需要 mock。
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request(
      Object.assign({}, options, {
        success: res => {
          if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode))
          if (res.data.code !== 0) return reject(new Error(res.data.message))
          resolve(res.data.data)
        },
        fail: err => reject(new Error(err.errMsg))
      })
    )
  })
}

const BASE = 'https://api.example.com'

function list(page = 1, size = 20) {
  return request({ url: `${BASE}/goods`, method: 'GET', data: { page, size } })
}

function detail(id) {
  if (!id) return Promise.reject(new Error('缺少 id'))
  return request({ url: `${BASE}/goods/${id}`, method: 'GET' })
}

module.exports = { list, detail, request, BASE }
