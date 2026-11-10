/** 同一时刻的相同 GET 请求复用同一个 Promise */
const inflight = new Map()

function keyOf(config) {
  return [config.method || 'GET', config.url, JSON.stringify(config.data || {})].join('|')
}

function dedupe(config, exec) {
  if (config.dedupe === false) return exec()
  if ((config.method || 'GET').toUpperCase() !== 'GET') return exec()

  const key = keyOf(config)
  if (inflight.has(key)) return inflight.get(key)

  const p = exec().finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

module.exports = { dedupe, keyOf, inflight }
