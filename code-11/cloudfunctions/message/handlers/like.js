/**
 * 点赞 / 取消点赞。
 *
 * 必须用事务：likes 表的增删 与 messages.likeCount 的增减要保持一致。
 *
 * 对照实验：
 *   1. 先写一个不用事务的版本
 *   2. 并发调用 20 次点赞/取消
 *   3. 检查 likeCount 与 likes 表实际条数是否一致
 *   4. 改成事务版本，重复实验，记录两次的数据差异
 */
module.exports = async function like({ messageId }, { OPENID }, cloud) {
  const db = cloud.database()
  const _ = db.command

  // TODO-10: 用事务实现
  //   1. likes 表增删 与 messages.likeCount 增减保持一致
  //   2. 重复点赞要幂等（已点过就取消，或直接返回当前状态 —— 你来定义并说明）
  //   3. 留言不存在或已被删除 → 返回明确错误

  return { code: 50100, message: 'TODO-10 未实现' }
}
