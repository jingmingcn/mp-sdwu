/**
 * 流量归因。
 *
 * 场景值速查（完整表见 ch-08）：
 *   1001 发现栏      1005/1006 搜索
 *   1007 单聊        1008 群聊        1044 带 shareTicket 的群分享
 *   1011 扫二维码    1047 扫小程序码  1048 长按识别小程序码
 *   1035 公众号菜单  1058 公众号文章
 *   1089/1090 下拉「最近使用」
 */
const SCENE_STRATEGY = {
  1011: 'scan', 1012: 'scan', 1013: 'scan', 1047: 'scan', 1048: 'scan',
  1007: 'share', 1008: 'share',
  1044: 'group',
  1089: 'recent', 1090: 'recent',
  1035: 'mp', 1058: 'mp'
}

// TODO-5: 解析启动参数，产出统一的来源对象
//   { channel, inviterId, goodsId, scene, isSinglePage, strategy }
function parseEntry() {
  const opts = wx.getLaunchOptionsSync()
  // opts.scene / opts.query / opts.path / opts.mode / opts.shareTicket / opts.referrerInfo
  return {}
}

let _ctx = null

// TODO-6: 把来源写入会话上下文，供本次会话内的埋点使用
function setEntryContext(entry) {}

function getEntryContext() { return _ctx }

module.exports = { parseEntry, setEntryContext, getEntryContext, SCENE_STRATEGY }
