/**
 * 实时日志封装。
 *
 * MP 后台 → 运维中心 → 实时日志，可按 openid 检索，保留 7 天。
 * 用户反馈问题时，这是最有效的排查手段。
 */
const rt = typeof wx !== 'undefined' && wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null

// TODO-26: 封装 RealtimeLogManager
const setTrace = key => rt && rt.setFilterMsg(key)
const addTrace = key => rt && rt.addFilterMsg(key)
const rlog = (...a) => rt && rt.info(...a)
const rwarn = (...a) => rt && rt.warn(...a)
const rerror = (...a) => rt && rt.error(...a)

module.exports = { setTrace, addTrace, rlog, rwarn, rerror }
