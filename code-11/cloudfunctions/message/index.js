/**
 * 留言板主云函数。
 *
 * 组织方式：一模块一函数 + 内部 action 路由。
 *   优点：冷启动次数少、只需一次 npm install、权限集中
 *   代价：函数体变大，需要自己做路由与错误处理
 */
const cloud = require('wx-server-sdk')

// ⚠ 初始化放在 handler 外面 —— 容器复用时只执行一次
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const handlers = {
  create: require('./handlers/create'),
  remove: require('./handlers/remove'),
  like: require('./handlers/like'),
  comment: require('./handlers/comment'),
  list: require('./handlers/list')
}

/** TODO-11: 冷启动测量 */
let coldStart = true
const initTime = Date.now()

/**
 * TODO-5: 统一入口
 *   1. 未知 action → { code: 40004 }
 *   2. try/catch，出错时 console.error 并返回 { code: 50000 }
 *   3. 统一返回 { code, data, message }
 */
exports.main = async (event, context) => {
  const isCold = coldStart
  coldStart = false
  console.log('[perf]', JSON.stringify({ isCold, sinceInit: Date.now() - initTime }))

  const { action, ...params } = event
  const ctx = cloud.getWXContext()   // ⚠ 唯一可信的身份来源

  const handler = handlers[action]
  if (!handler) return { code: 40004, message: '未知操作: ' + action }

  try {
    return await handler(params, ctx, cloud)
  } catch (e) {
    console.error(`[${action}]`, e)
    return { code: 50000, message: e.message || '服务异常' }
  }
}
