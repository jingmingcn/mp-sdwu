/**
 * 发布留言。
 *
 * ⚠ 永远不要信任 event 里的用户标识 —— 用 getWXContext() 给的 OPENID。
 */
module.exports = async function create({ content, images = [] }, { OPENID }, cloud) {
  const db = cloud.database()
  const _ = db.command

  // TODO-6: 校验
  //   content: trim 后 1–500 字
  //   images: 最多 9 张，且必须以 cloud:// 开头（防止注入外部 URL）

  // TODO-7: 频率限制 —— 同一用户 60 秒内最多发 3 条
  //   提示：查最近 60 秒该 openid 的记录数

  // TODO-8: 内容安全检测（云调用）
  //   const res = await cloud.openapi.security.msgSecCheck({
  //     version: 2, scene: 2, openid: OPENID, content
  //   })
  //   res.result.suggest: 'pass' | 'review' | 'risky'
  //   risky → status: 'rejected'，并返回明确提示

  // TODO-9: 写入数据库
  //   ⚠ _openid 由云开发自动写入，不要自己传 —— 但要理解为什么
  //   createdAt 必须用 db.serverDate()，不能用 new Date()：
  //     云函数虽然跑在服务器上，但如果时间来自 event（客户端传的），就可被伪造；
  //     serverDate() 由数据库服务端生成，不可篡改，也不受函数实例时区影响。

  return { code: 50100, message: 'TODO-6~9 未实现' }
}
