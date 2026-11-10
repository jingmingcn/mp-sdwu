/**
 * 能力降级统一封装。
 *
 * 原则：任何开放能力都可能因为
 *   基础库版本 / 主体资质 / 用户拒绝 / 接口未申请 / 平台策略调整
 * 而失败。**每一个开放能力调用都必须有降级路径。**
 */
const degrades = []

/**
 * TODO-20: 实现 withFallback
 *   1. canIUse 不支持 → 直接走 fallback
 *   2. primary 抛错 → 记录原因后走 fallback
 *   3. 两者都失败 → 抛出，由调用方处理
 */
async function withFallback(name, primary, fallback) {
  return fallback()
}

// TODO-21: 记录降级事件，便于统计各能力的可用率
function reportDegrade(name, reason) {}

function getDegrades() { return degrades.slice() }

/**
 * TODO-22: 通用的授权申请
 *
 * 必答：
 *   为什么用户拒绝一次后 wx.authorize 不再弹窗？
 *   wx.openSetting 为什么必须由用户点击触发？
 *   这两个限制是为了防什么？
 */
async function ensureScope(scope, { title, content } = {}) {
  const setting = await wx.getSetting()
  if (setting.authSetting[scope]) return true

  try {
    await wx.authorize({ scope })
    return true
  } catch (e) {
    // 用户之前拒绝过 → authorize 直接 fail，不会再弹窗
    const { confirm } = await wx.showModal({
      title: title || '需要授权',
      content: content || '请在设置中开启相应权限',
      confirmText: '去设置'
    })
    if (!confirm) return false
    const res = await wx.openSetting()   // ⚠ 只能由用户点击触发
    return !!res.authSetting[scope]
  }
}

module.exports = { withFallback, reportDegrade, getDegrades, ensureScope }
