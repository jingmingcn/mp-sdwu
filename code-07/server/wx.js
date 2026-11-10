const crypto = require('crypto')

/**
 * 用 code 换 openid / session_key。
 *
 * ⚠ WX_SECRET 只能出现在服务端。
 *   如果它出现在小程序代码里，攻击者可以：
 *     1. 用它换 access_token，进而调用所有服务端接口（发订阅消息、生成小程序码…）
 *     2. 伪造任意用户的登录（自己造 code2Session 的调用）
 *     3. 修改小程序的服务器配置、下载用户数据
 */
async function code2Session(code) {
  if (!code) throw Object.assign(new Error('缺少 code'), { code: 40001 })

  if (process.env.MOCK_WX === 'true') {
    // TODO-1: Mock 分支
    //   要求：同一个 code 得到同一个 openid（便于反复测试）
    //   提示：openid = 'mock_' + sha1(code).slice(0, 16)
    //   同时要模拟「code 一次性」的特性 —— 见 usedCodes
    return { openid: 'mock_todo', session_key: 'mock_session_key' }
  }

  const params = new URLSearchParams({
    appid: process.env.WX_APPID,
    secret: process.env.WX_SECRET,
    js_code: code,
    grant_type: 'authorization_code'
  })
  const res = await fetch(`https://api.weixin.qq.com/sns/jscode2session?${params}`)
  const data = await res.json()
  if (data.errcode) throw Object.assign(new Error(data.errmsg), { code: data.errcode })
  return data
}

/** 模拟 code 的一次性：用过的 code 再用会报 40163 */
const usedCodes = new Map()

function markCodeUsed(code) {
  usedCodes.set(code, Date.now())
}

function isCodeUsed(code) {
  return usedCodes.has(code)
}

function sha1(s) {
  return crypto.createHash('sha1').update(s).digest('hex')
}

module.exports = { code2Session, markCodeUsed, isCodeUsed, sha1 }
