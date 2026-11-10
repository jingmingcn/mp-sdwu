const PREFIX = 'app:'

function setItem(key, value, ttlMs) {
  const record = { v: value, e: ttlMs ? Date.now() + ttlMs : 0 }
  try { wx.setStorageSync(PREFIX + key, record) } catch (e) { console.error('[storage]', e) }
}

function getItem(key, defaultValue = null) {
  try {
    const r = wx.getStorageSync(PREFIX + key)
    if (!r || typeof r !== 'object') return defaultValue
    if (r.e && Date.now() > r.e) { wx.removeStorageSync(PREFIX + key); return defaultValue }
    return r.v
  } catch (e) { return defaultValue }
}

function removeItem(key) {
  try { wx.removeStorageSync(PREFIX + key) } catch (e) {}
}

module.exports = { setItem, getItem, removeItem, PREFIX }
