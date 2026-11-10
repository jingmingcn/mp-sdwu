/**
 * 发表评论，并给留言作者发订阅消息。
 */
module.exports = async function comment({ messageId, content }, { OPENID }, cloud) {
  const db = cloud.database()
  const _ = db.command

  // 校验 + 安全检测（同 create）
  // 写入 comments，同时 messages.commentCount +1（同样需要事务）

  // TODO-22: 通知作者
  //   1. 检查订阅余额（subscriptions 集合）
  //   2. cloud.openapi.subscribeMessage.send({...})
  //   3. 成功则余额 -1；errcode 43101 则余额清零
  //   ⚠ thing 类型最多 20 个汉字，truncate 必须实现正确

  return { code: 50100, message: 'TODO 未实现' }
}

/** thing 类型截断到 20 个字符 */
function truncate(s, n = 20) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
