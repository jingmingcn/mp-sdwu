/** 纯函数集合 —— 不依赖 wx.*，可在 Node 里直接单测 */

/** 分 → '￥12.34'；空值返回 '--' */
function formatPrice(cent) {
  if (cent === null || cent === undefined || Number.isNaN(Number(cent))) return '--'
  return '￥' + (Number(cent) / 100).toFixed(2)
}

/** 超长截断 */
function ellipsis(str, n) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

/** 跨端安全的日期解析：iOS 的 JSC 不接受 '2026-01-01 10:00:00' */
function parseDate(input) {
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)
  if (typeof input !== 'string') return new Date(NaN)
  return new Date(input.trim().replace(/-/g, '/'))
}

const pad2 = n => (n < 10 ? '0' : '') + n

/** 时间戳 → 'MM-DD HH:mm' */
function formatTime(ts) {
  const d = parseDate(ts)
  if (Number.isNaN(d.getTime())) return '--'
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** 安全取值，等价于 lodash.get 但只有 8 行 */
function get(obj, path, defaultValue) {
  const keys = String(path).split('.')
  let cur = obj
  for (const k of keys) {
    if (cur === null || cur === undefined) return defaultValue
    cur = cur[k]
  }
  return cur === undefined ? defaultValue : cur
}

module.exports = { formatPrice, ellipsis, parseDate, formatTime, pad2, get }
