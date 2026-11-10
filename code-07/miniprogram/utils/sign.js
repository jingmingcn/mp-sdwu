const CryptoJS = require('crypto-js')

/**
 * 接口签名。
 *
 *   sign = HMAC-SHA256(secret, sortedParams + &_ts= + &_nonce=)
 *
 * 服务端校验：timestamp 在 ±5 分钟内 + nonce 未用过 + 签名一致。
 *
 * ⚠ 必答：小程序包可被反编译，SIGN_KEY 必然泄漏。
 *   那么签名机制实际挡住了哪一类攻击？没挡住哪一类？
 *   （提示：挡住了「中间人随手改参数」与「无脑重放」；
 *    挡不住「有心人反编译后自己签」）
 */
function sign(params, secret) {
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).slice(2, 10)

  // TODO-27: 按 key 升序拼接，跳过 undefined / null
  const sorted = ''

  const raw = `${sorted}&_ts=${timestamp}&_nonce=${nonce}`
  return { timestamp, nonce, sign: CryptoJS.HmacSHA256(raw, secret).toString() }
}

module.exports = { sign }
