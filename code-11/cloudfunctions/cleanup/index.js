/**
 * 每天凌晨 3 点跑的清理任务。
 *
 * ⚠ Cron 是 7 位（秒 分 时 日 月 周 年），时区 UTC+8。
 *   "0 0 3 * * * *" = 每天 3:00:00
 *
 * ⚠ 定时任务可能被重复触发，**必须幂等**。
 * ⚠ 云函数最长 60 秒，超时的任务要分批处理。
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  console.log('[cleanup] 触发', event.TriggerName, event.Time)

  // TODO-23: 实现清理任务
  // 1. 幂等保护：同一天只跑一次（jobs 集合，key = name + date）
  // 2. 删除 30 天前的 rejected 留言及其图片
  // 3. 清理孤儿文件：云存储里存在、但数据库里没引用的图片
  // 4. 修正 likeCount：与 likes 表实际条数对齐
  // 5. 分批处理，避免超时
  // 6. 返回本次清理的统计数据并写入日志集合

  return { code: 0, data: { skipped: true, reason: 'TODO-23 未实现' } }
}
