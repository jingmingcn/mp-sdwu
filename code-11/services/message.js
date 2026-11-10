/**
 * 留言板数据访问层。
 *
 * 判断标准：这个操作**需要业务校验**吗？
 *   需要 → 云函数（拥有管理员权限，且 getWXContext 提供可信身份）
 *   只是读公开数据 → 可以前端直连（省一次函数冷启动）
 */
const db = () => wx.cloud.database()
const _ = () => wx.cloud.database().command

/** 统一调用云函数并解包 */
async function call(action, params = {}) {
  const { result } = await wx.cloud.callFunction({
    name: 'message',
    data: Object.assign({ action }, params)
  })
  if (!result || result.code !== 0) {
    throw Object.assign(new Error((result && result.message) || '操作失败'), { code: result && result.code })
  }
  return result.data
}

// ── 前端直连（只读公开数据）──

/** TODO-4 方案 A：skip + limit 分页 */
async function pageBySkip(page = 1, size = 20) {
  return []
}

/** TODO-4 方案 B：游标分页（用上一页最后一条的 createdAt + _id） */
async function pageByCursor(cursor, size = 20) {
  return { items: [], nextCursor: null }
}

/** 我自己的留言（含审核中）—— 权限模型保证只能读到 _openid 匹配的 */
async function myMessages() {
  const { data } = await db().collection('messages')
    .where({}) // 权限为「仅创建者可写、所有人可读」时这里要显式加 _openid 条件
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
  return data
}

// ── 云函数（需要校验的写操作）──

const create = (content, images) => call('create', { content, images })
const remove = messageId => call('remove', { messageId })
const like = messageId => call('like', { messageId })
const comment = (messageId, content) => call('comment', { messageId, content })
const list = params => call('list', params)

module.exports = { call, pageBySkip, pageByCursor, myMessages, create, remove, like, comment, list, db, _ }
