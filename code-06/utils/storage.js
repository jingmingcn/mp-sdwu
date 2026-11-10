/**
 * 带 TTL 的 Storage 封装。
 *
 * 事实提醒：
 *   单 key 上限 1MB，单小程序上限 10MB
 *   Storage 随时可能被系统回收 —— 绝不能当数据库
 */
const PREFIX = 'app:'

// TODO-22: 存储时包一层 { v: value, e: expireAt }
function setItem(key, value, ttlMs) {}

// TODO-23: 读取时检查过期，过期则删除并返回默认值
function getItem(key, defaultValue = null) {
  return defaultValue
}

function removeItem(key) {
  return wx.removeStorage({ key: PREFIX + key, fail: () => {} })
}

// TODO-25: 遍历所有 PREFIX 开头的 key，删除已过期的
//   提示：wx.getStorageInfoSync().keys
function purgeExpired() {}

// TODO-24: 写入失败（超限）时清理过期项后重试一次
async function safeSet(key, value, ttl) {}

module.exports = { setItem, getItem, removeItem, purgeExpired, safeSet, PREFIX }
