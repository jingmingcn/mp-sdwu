/**
 * 请求去重：同一时刻的相同 GET 请求复用同一个 Promise。
 *
 * 典型收益：页面 A、组件 B、组件 C 都要用户信息 ——
 * 不去重是 3 个请求，去重后 1 个。
 */
const inflight = new Map()

// TODO-16: key = method|url|JSON(data)
function keyOf(config) {
  return ''
}

/**
 * TODO-17: 只对 GET 生效；config.dedupe === false 时跳过。
 *   同 key 的在途请求复用同一个 Promise，完成后必须清理。
 *
 * 思考：为什么 POST 不能去重？有没有例外？
 */
function dedupe(config, exec) {
  return exec()
}

module.exports = { dedupe, keyOf, inflight }
