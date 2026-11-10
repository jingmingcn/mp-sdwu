/**
 * 批量插入测试数据。
 *
 * 索引对比实验需要 5000 条 —— 云函数单次最长 60 秒，
 * 所以这里支持分批调用：{ from: 0, count: 500 }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async ({ from = 0, count = 500, clean = false }) => {
  if (clean) {
    // 注意：小程序端删不了别人的数据，但云函数有管理员权限
    const res = await db.collection('messages').where({ seed: true }).remove()
    return { code: 0, data: { removed: res.stats.removed } }
  }

  const now = Date.now()
  const tasks = []
  for (let i = from; i < from + count; i++) {
    tasks.push(db.collection('messages').add({
      data: {
        seed: true,
        content: `测试留言 ${i} —— 山东大学百廿校庆纪念`,
        images: [],
        authorName: '测试用户 ' + (i % 100),
        likeCount: i % 37,
        commentCount: i % 11,
        status: i % 13 === 0 ? 'rejected' : 'published',
        createdAt: new Date(now - i * 60_000)
      }
    }))
  }

  const results = await Promise.all(tasks.map(p => p.catch(e => ({ error: e.message }))))
  const failed = results.filter(r => r.error).length
  return { code: 0, data: { inserted: results.length - failed, failed, from, count } }
}
