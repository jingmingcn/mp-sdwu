/**
 * 删除留言。
 *
 * TODO-17: 删除时同步清理
 *   1. 只能删自己的（用 OPENID 而不是参数里的作者 id）
 *   2. 删除关联的 likes 与 comments
 *   3. 删除云存储里的图片（cloud.deleteFile）
 *   4. 顺序：先删数据库还是先删文件？想清楚失败时会留下什么
 *
 * 必答：
 *   删数据库成功、删文件失败 → 留下什么？如何补救？
 *   删文件成功、删数据库失败 → 留下什么？哪个后果更严重？
 */
module.exports = async function remove({ messageId }, { OPENID }, cloud) {
  return { code: 50100, message: 'TODO-17 未实现' }
}
