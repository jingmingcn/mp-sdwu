const { getItem, safeSet } = require('../utils/storage')

// TODO-26: Cache First —— 有缓存直接返回，无则请求并写缓存
async function cacheFirst(key, fetcher, ttl) {}

// TODO-27: Network First —— 先请求，失败降级到缓存
async function networkFirst(key, fetcher, ttl) {}

/**
 * TODO-28: SWR —— 立即返回缓存并后台刷新
 *
 * TODO-29: onUpdate 里只在数据确实变化时才 setData，避免列表无谓跳动。
 *   提示：算一个轻量签名（id 序列 + 更新时间）做比较。
 */
async function swr(key, fetcher, { ttl = 300000, onUpdate } = {}) {}

/** 轻量签名，用于判断数据是否实质变化 */
function signature(list) {
  if (!Array.isArray(list)) return JSON.stringify(list)
  return list.map(x => `${x.id}:${x.updatedAt || ''}`).join(',')
}

module.exports = { cacheFirst, networkFirst, swr, signature }
