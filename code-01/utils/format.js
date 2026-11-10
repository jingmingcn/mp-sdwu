/**
 * 纯函数集合 —— 不依赖 wx.*，可直接在 Node 里单测。
 * 后续实验（尤其第十二章）会为它写测试。
 */

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

/**
 * 跨端安全的日期解析。
 *
 * iOS 的 JavaScriptCore 不接受 '2026-01-01 10:00:00' 这种格式，
 * 会返回 Invalid Date。统一转成 ISO 格式再解析。
 */
function parseDate(input) {
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)
  if (typeof input !== 'string') return new Date(NaN)
  return new Date(input.trim().replace(/-/g, '/'))
}

function pad2(n) {
  return (n < 10 ? '0' : '') + n
}

/** 时间戳 → 'MM-DD HH:mm' */
function formatTime(ts) {
  const d = parseDate(ts)
  if (Number.isNaN(d.getTime())) return '--'
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

module.exports = { formatPrice, ellipsis, parseDate, formatTime, pad2 }
