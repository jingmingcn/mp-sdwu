/**
 * 功能开关。
 *
 * 为什么重要：小程序发版要走审核（0.5–2 天），出问题不能立即改代码。
 * 开关让你能在几秒内关掉一个有问题的功能 ——
 * 这是小程序线上运维最重要的一张底牌。
 */
const { getItem } = require('../utils/storage')
// TODO-30 实现后台刷新时会用到 setItem：
// const { setItem } = require('../utils/storage')

const CACHE_KEY = 'feature:flags'

/** 代码里的兜底默认值：新功能一律默认关闭（出问题时"什么都不做"最安全） */
const DEFAULTS = {
  newCheckout: false,
  virtualList: false,
  skylineHome: false
}

let flags = Object.assign({}, DEFAULTS)

/**
 * TODO-30: 实现开关系统
 *
 * 1. 用 SWR：先用本地缓存，后台刷新
 * 2. 接口失败时用「上次成功的值」，再失败用代码里的默认值
 * 3. 支持按用户分流（如 uid % 100 < 10 表示 10% 灰度）
 *
 * ⚠ 三种场景都不能崩：
 *   接口正常 / 接口超时（用缓存）/ 接口错误且无缓存（用默认值）
 */
async function initFlags() {
  const cached = getItem(CACHE_KEY)
  if (cached) flags = Object.assign({}, DEFAULTS, cached)

  // TODO-30: 后台刷新
  return flags
}

function isOn(key, fallback) {
  const v = flags[key]
  if (v === undefined) return fallback === undefined ? DEFAULTS[key] || false : fallback
  return !!v
}

/** A/B 分流：同一用户在两次启动间必须落在同一组，否则数据不可用 */
function variant(key, fallback = 'A') {
  const v = flags[key + ':variant']
  return v || fallback
}

module.exports = { initFlags, isOn, variant, DEFAULTS, CACHE_KEY, __setFlags: f => (flags = f) }
