const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { refreshTokens } = require('./store')

/**
 * 双令牌方案：
 *   access  —— JWT，2 小时，无状态，无法即时吊销
 *   refresh —— 不透明随机串，7 天，存服务端，可即时吊销
 *
 * refresh token rotation（每次刷新都换新的）能防住：
 *   refresh token 被窃取后的长期滥用 ——
 *   一旦攻击者用了一次，合法用户的那份就失效，用户重新登录时能发现异常；
 *   反过来如果合法用户先用，攻击者手里的就作废了。
 */

// TODO-2: 签发 access token
function signAccess(uid) {
  return ''
}

// TODO-3: 校验 access token，返回 uid 或抛错
function verifyAccess(token) {
  return null
}

// TODO-4: 签发 refresh token 并写入 store
function issueRefresh(uid) {
  const token = crypto.randomBytes(32).toString('hex')
  // refreshTokens.set(token, { uid, expireAt: ..., used: false })
  return token
}

/**
 * TODO-5: 消费 refresh token（一次性）
 *   不存在 / 已过期 / 已使用过 → 抛错
 *   校验通过后标记为已使用，并返回 uid
 */
function consumeRefresh(token) {
  return null
}

// TODO-6: 吊销某用户的全部 refresh（登出 / 封禁时用）
function revokeAll(uid) {}

module.exports = { signAccess, verifyAccess, issueRefresh, consumeRefresh, revokeAll }
