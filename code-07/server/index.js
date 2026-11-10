require('dotenv').config()
const express = require('express')
const store = require('./store')
const { code2Session, markCodeUsed, isCodeUsed } = require('./wx')
const { signAccess, verifyAccess, issueRefresh, consumeRefresh, revokeAll } = require('./token')

const app = express()
app.use(express.json())

// 请求日志 —— 用它证明「6 个并发 401 只刷新 1 次」
let n = 0
app.use((req, res, next) => {
  console.log(`#${String(++n).padStart(4, '0')} ${new Date().toISOString().slice(11, 23)} ${req.method.padEnd(6)} ${req.path}`)
  next()
})

const ok = (res, data) => res.json({ code: 0, message: 'ok', data })
const fail = (res, status, code, message) => res.status(status).json({ code, message })

/**
 * TODO-10: 鉴权中间件
 *   从 Authorization: Bearer <token> 取出并校验，把 uid 挂到 req.uid
 *   校验失败 → 401
 */
function auth(req, res, next) {
  // const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  // ...
  next()
}

/** 仅管理员 —— 注意 isAdmin 来自数据库，不来自请求 */
function adminOnly(req, res, next) {
  const user = store.users.get(req.uid)
  if (!user || !user.isAdmin) return fail(res, 403, 40300, '无权限')
  next()
}

// ─────────────────────────── 认证 ───────────────────────────

/**
 * TODO-7: POST /auth/login
 *   { code } → { accessToken, refreshToken, expiresIn, user }
 *
 * ⚠ session_key 存服务端（store.sessionKeys），永远不出现在响应里。
 *   请在报告里贴出本接口的完整响应，证明这一点。
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { code } = req.body
    if (isCodeUsed(code)) return fail(res, 400, 40163, 'code been used')
    // const { openid, unionid, session_key } = await code2Session(code)
    // markCodeUsed(code)
    // const user = store.findOrCreateByOpenid(openid, unionid)
    // store.sessionKeys.set(user.id, session_key)
    // ok(res, { accessToken: ..., refreshToken: ..., expiresIn: 7200, user: store.publicUser(user) })
    fail(res, 501, 50100, 'TODO-7 未实现')
  } catch (e) {
    fail(res, 400, e.code || 40000, e.message)
  }
})

/**
 * TODO-8: POST /auth/refresh
 *   { refreshToken } → 新的一对 token
 *   refreshToken 无效 / 过期 / 已使用过 → 401
 */
app.post('/auth/refresh', (req, res) => {
  fail(res, 501, 50100, 'TODO-8 未实现')
})

/** TODO-9: POST /auth/logout —— 吊销该用户全部 refresh token */
app.post('/auth/logout', auth, (req, res) => {
  fail(res, 501, 50100, 'TODO-9 未实现')
})

// ─────────────────────────── 业务 ───────────────────────────

/** TODO-11: GET /profile —— ⚠ 必须用 req.uid，不能用 req.query.uid */
app.get('/profile', auth, (req, res) => {
  fail(res, 501, 50100, 'TODO-11 未实现')
})

/**
 * TODO-12: GET /orders
 *
 * 攻防演练一：先故意改成用 req.query.uid，攻击成功后再改回 req.uid。
 *   ✗ const uid = Number(req.query.uid)
 *   ✓ const uid = req.uid
 */
app.get('/orders', auth, (req, res) => {
  fail(res, 501, 50100, 'TODO-12 未实现')
})

/** TODO-13: POST /admin/reset —— 仅管理员 */
app.post('/admin/reset', auth, adminOnly, (req, res) => {
  fail(res, 501, 50100, 'TODO-13 未实现')
})

/**
 * 签到领 10 积分 —— 攻防演练四（重放）的靶子。
 *
 * 第一步：不加任何防护，连续调 20 次，记录积分变成多少。
 * 第二步：实现防护（幂等 / 限流 / 签名+nonce 三选一或全做）。
 * 第三步：再攻击一次，证明防住了。
 */
app.post('/checkin', auth, (req, res) => {
  const user = store.users.get(req.uid)
  if (!user) return fail(res, 404, 40400, '用户不存在')

  // TODO（攻防演练四）：在这里加幂等保护
  // const key = `${req.uid}:${new Date().toISOString().slice(0, 10)}`
  // if (store.checkins.has(key)) return ok(res, { points: user.points, already: true })
  // store.checkins.set(key, true)

  user.points += 10
  ok(res, { points: user.points })
})

// ────────────────────────── 调试 ──────────────────────────

/** 让当前用户的 access token 立即失效（把 JWT_SECRET 轮换掉是更彻底的做法，这里用黑名单） */
const revokedAccess = new Set()
app.post('/debug/expire-token', auth, (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  revokedAccess.add(token)
  ok(res, { expired: true })
})
app.use((req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (token && revokedAccess.has(token)) return fail(res, 401, 40100, '登录已失效')
  next()
})

/** 把当前用户设为管理员（仅用于演示 adminOnly 的正确路径） */
app.post('/debug/make-admin', auth, (req, res) => {
  const u = store.users.get(req.uid)
  if (u) u.isAdmin = true
  ok(res, store.publicUser(u))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n实验七服务端： http://localhost:${PORT}`)
  console.log(`MOCK_WX = ${process.env.MOCK_WX}\n`)
})
