/** 带 TTL 的 Storage 封装 */
const PREFIX = 'app:'

function setItem(key, value, ttlMs) {
  const record = { v: value, e: ttlMs ? Date.now() + ttlMs : 0 }
  try {
    wx.setStorageSync(PREFIX + key, record)
    return true
  } catch (e) {
    purgeExpired()
    try {
      wx.setStorageSync(PREFIX + key, record)
      return true
    } catch (e2) {
      return false
    }
  }
}

function getItem(key, defaultValue = null) {
  try {
    const r = wx.getStorageSync(PREFIX + key)
    if (!r || typeof r !== 'object') return defaultValue
    if (r.e && Date.now() > r.e) {
      wx.removeStorageSync(PREFIX + key)
      return defaultValue
    }
    return r.v
  } catch (e) {
    return defaultValue
  }
}

function removeItem(key) {
  try {
    wx.removeStorageSync(PREFIX + key)
  } catch (e) {
    /* ignore */
  }
}

function purgeExpired() {
  const { keys } = wx.getStorageInfoSync()
  let removed = 0
  keys.filter(k => k.indexOf(PREFIX) === 0).forEach(k => {
    const r = wx.getStorageSync(k)
    if (r && typeof r === 'object' && r.e && Date.now() > r.e) {
      wx.removeStorageSync(k)
      removed++
    }
  })
  return removed
}

module.exports = { setItem, getItem, removeItem, purgeExpired, PREFIX }
