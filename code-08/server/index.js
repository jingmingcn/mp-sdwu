/**
 * 实验八 Mock 服务端（零依赖）。
 *
 * 返回结构与真实微信接口**完全一致**，
 * 所以没有企业主体也能把流程走通。
 */
const http = require('http')
const url = require('url')
const crypto = require('crypto')
const { validate } = require('./tmpl-validate')

const PORT = process.env.PORT || 3000

const subscriptions = new Map()   // `${openid}:${tmplId}` -> 余额
const scenes = new Map()          // shortKey -> { params, expireAt }
const pushed = []                 // 推送记录

let n = 0
const log = (req, extra = '') =>
  console.log(`#${String(++n).padStart(4, '0')} ${req.method.padEnd(6)} ${url.parse(req.url).pathname}  ${extra}`)

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  })
  res.end(JSON.stringify(body))
}
const ok = (res, data) => json(res, 200, { code: 0, message: 'ok', data })
const nano = (n = 8) => crypto.randomBytes(16).toString('base64url').slice(0, n)

async function body(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch (e) { return {} }
}

const openidOf = req => req.headers['x-mock-openid'] || 'mock_openid_default'

const routes = {
  /** 记录订阅：accept 一次余额 +1（可累积） */
  async '/subscribe'(req, res) {
    const { tmplIds = [] } = await body(req)
    const openid = openidOf(req)
    // TODO-12（服务端侧）：余额 +1
    tmplIds.forEach(id => {
      const key = `${openid}:${id}`
      subscriptions.set(key, (subscriptions.get(key) || 0) + 1)
    })
    log(req, `openid=${openid} +${tmplIds.length} 个模板`)
    ok(res, { balances: tmplIds.map(id => ({ id, n: subscriptions.get(`${openid}:${id}`) })) })
  },

  async '/subscribe/balance'(req, res, q) {
    const openid = openidOf(req)
    const list = [...subscriptions.entries()]
      .filter(([k]) => k.startsWith(openid + ':'))
      .map(([k, v]) => ({ tmplId: k.split(':')[1], n: v }))
    log(req)
    ok(res, list)
  },

  /**
   * 模拟发货 → 触发一次订阅消息推送。
   * TODO-13/14（服务端侧）：先校验余额与字段格式，推送成功后余额 -1。
   */
  async '/debug/ship'(req, res) {
    const { tmplId, data } = await body(req)
    const openid = openidOf(req)
    const key = `${openid}:${tmplId}`
    const balance = subscriptions.get(key) || 0

    const v = validate(data || {})
    if (!v.ok) {
      log(req, '字段格式错误 → 47003')
      return json(res, 200, { code: 47003, message: '模板参数不正确', data: v.errors })
    }
    if (balance <= 0) {
      log(req, '余额不足 → 43101')
      return json(res, 200, { code: 43101, message: '用户拒绝接收或订阅次数已用完' })
    }

    subscriptions.set(key, balance - 1)
    pushed.push({ openid, tmplId, data, at: new Date().toISOString() })
    log(req, `推送成功，余额 ${balance} → ${balance - 1}`)
    ok(res, { errcode: 0, remain: balance - 1 })
  },

  async '/debug/pushed'(req, res) { log(req); ok(res, pushed) },

  /**
   * 小程序码：scene 最长 32 字符 —— 超长会被拒绝。
   * TODO-16：客户端应该用短 key 映射。
   */
  async '/qrcode'(req, res) {
    const { page = 'pages/index/index', scene = '', params } = await body(req)

    if (params) {
      // 短 key 方案
      const key = nano(8)
      scenes.set(key, { params, expireAt: Date.now() + 30 * 86400_000 })
      log(req, `短 key=${key} → ${JSON.stringify(params).slice(0, 40)}…`)
      return ok(res, { scene: key, page, image: mockQr(key, page) })
    }

    if (scene.length > 32) {
      log(req, `scene 长度 ${scene.length} > 32 → 拒绝`)
      return json(res, 200, { code: 40129, message: 'scene 长度不能超过 32 个字符' })
    }
    log(req, `scene=${scene}`)
    ok(res, { scene, page, image: mockQr(scene, page) })
  },

  /** 短 key → 完整参数 */
  async '/scene'(req, res, q) {
    const rec = scenes.get(q.key)
    log(req, `key=${q.key} ${rec ? 'hit' : 'MISS'}`)
    if (!rec || rec.expireAt < Date.now()) return json(res, 404, { code: 40400, message: 'scene 已失效' })
    ok(res, rec.params)
  },

  /** 手机号：真实接口需要非个人主体，这里返回结构一致的 Mock */
  async '/user/phone'(req, res) {
    const { code } = await body(req)
    log(req, `code=${code}`)
    if (!code) return json(res, 200, { code: 40001, message: '缺少 code' })
    ok(res, { phoneNumber: '138****8000', purePhoneNumber: '13800008000', countryCode: '86' })
  },

  /** 强制失败开关，用于演示降级路径 */
  async '/debug/force-fail'(req, res, q) {
    log(req, `capability=${q.name}`)
    json(res, 500, { code: 50000, message: `${q.name} 强制失败（用于演示降级）` })
  }
}

/** 生成一张可扫的普通二维码（SVG → data URI），内容是 mock:// 链接 */
function mockQr(scene, page) {
  const text = `mock://${page}?scene=${encodeURIComponent(scene)}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <rect width="240" height="240" fill="#fff"/>
    <text x="12" y="120" font-size="10" fill="#333">${text}</text>
  </svg>`
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    })
    return res.end()
  }
  const { pathname, query } = url.parse(req.url, true)
  const h = routes[pathname]
  if (!h) { log(req, '→ 404'); return json(res, 404, { code: 40400, message: '接口不存在' }) }
  try { await h(req, res, query) } catch (e) { console.error(e); json(res, 500, { code: 50000, message: e.message }) }
}).listen(PORT, () => {
  console.log(`\n实验八 Mock 服务端： http://localhost:${PORT}`)
  Object.keys(routes).forEach(r => console.log('  ' + r))
  console.log()
})
