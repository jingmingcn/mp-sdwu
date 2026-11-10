/**
 * 留言列表。
 *
 * 注意：小程序端 get() 单次最多 20 条，云函数端 100 条。
 *       必须为 status + createdAt 建索引，否则大数据量下会全表扫描超时。
 */
module.exports = async function list({ cursor, size = 20, mine = false }, { OPENID }, cloud) {
  const db = cloud.database()
  const _ = db.command

  const where = mine ? { _openid: OPENID } : { status: 'published' }
  if (cursor) where.createdAt = _.lt(new Date(cursor))

  const { data } = await db.collection('messages')
    .where(where)
    .orderBy('createdAt', 'desc')
    .limit(Math.min(size, 100))
    .get()

  const nextCursor = data.length === size ? data[data.length - 1].createdAt : null

  // 标注当前用户是否点赞过（用 likes 表批量查，避免 N+1）
  const ids = data.map(m => m._id)
  let likedSet = new Set()
  if (ids.length) {
    const { data: likes } = await db.collection('likes')
      .where({ _openid: OPENID, messageId: _.in(ids) })
      .get()
    likedSet = new Set(likes.map(l => l.messageId))
  }

  return {
    code: 0,
    data: {
      items: data.map(m => Object.assign({}, m, { liked: likedSet.has(m._id) })),
      nextCursor
    }
  }
}
