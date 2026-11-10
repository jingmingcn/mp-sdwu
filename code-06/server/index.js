/**
 * 实验六 Mock 服务器（零依赖，Node 原生 http）
 *
 *   npm start        # http://localhost:3000
 *
 * 每个请求都会打印一行日志 —— 用它来证明「401 只刷新一次」「去重生效」。
 */
const http = require('http')
const url = require('url')

const PORT = process.env.PORT || 3000
let hit = 0

const VALID_TOKENS = new Set()
let loginCount = 0

function log(req, extra = '') {
  const u = url.parse(req.url, true)
  console.log(
    `#${String(++hit).padStart(4, '0')} ${new Date().toISOString().slice(11, 23)} ` +
    `${req.method.padEnd(6)} ${u.pathname}${extra ? '  ' + extra : ''}`
  )
}

function json(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  })
  res.end(payload)
}

const ok = (res, data) => json(res, 200, { code: 0, message: 'ok', data })
const sleep = ms => new Promise(r => setTimeout(r, ms))

function goods(page = 1, size = 20) {
  const start = (page - 1) * size
  return {
    total: 137,
    items: Array.from({ length: size }, (_, i) => ({
      id: start + i,
      title: `商品 ${start + i}`,
      priceInCent: 1000 + (start + i) * 7,
      updatedAt: '2026-08-01'
    }))
  }
}

async function readBody(req) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString()) } catch (e) { return {} }
}

const routes = {
  /** 正常列表 */
  async '/goods'(req, res, q) {
    log(req, `page=${q.page || 1}`)
    await sleep(80)
    ok(res, goods(Number(q.page) || 1, Number(q.size) || 20))
  },

  /** 延迟指定毫秒 —— 测超时与并发限流 */
  async '/slow'(req, res, q) {
    const ms = Number(q.ms) || 1000
    log(req, `ms=${ms}`)
    await sleep(ms)
    ok(res, { ms, at: Date.now() })
  },

  /** 按概率返回 500 —— 测重试 */
  async '/flaky'(req, res, q) {
    const rate = q.rate === undefined ? 0.5 : Number(q.rate)
    const fail = Math.random() < rate
    log(req, `rate=${rate} ${fail ? 'FAIL' : 'OK'}`)
    if (fail) return json(res, 500, { code: 50000, message: '服务开小差了' })
    ok(res, { lucky: true })
  },

  /** HTTP 200 但业务失败 */
  async '/biz-error'(req, res) {
    log(req)
    json(res, 200, { code: 40001, message: '库存不足，请选择其他规格' })
  },

  /** 需要有效 token */
  async '/secure'(req, res) {
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    const valid = VALID_TOKENS.has(token)
    log(req, valid ? 'token ok' : 'token INVALID → 401')
    if (!valid) return json(res, 401, { code: 40100, message: '登录已失效' })
    ok(res, { secret: '只有登录用户能看到这句话' })
  },

  /** 用 code 换 token */
  async '/auth/login'(req, res) {
    loginCount++
    log(req, `★ 第 ${loginCount} 次登录（若同时 6 个 401 只应出现 1 次）`)
    await sleep(150)
    const token = 't_' + Date.now().toString(36)
    VALID_TOKENS.clear()
    VALID_TOKENS.add(token)
    ok(res, { token, expiresIn: 7200 })
  },

  /** 让当前 token 立即失效 */
  async '/debug/expire-token'(req, res) {
    log(req, '清空所有 token')
    VALID_TOKENS.clear()
    ok(res, { expired: true })
  },

  /** 重置登录计数 */
  async '/debug/reset'(req, res) {
    log(req)
    loginCount = 0
    VALID_TOKENS.clear()
    ok(res, { reset: true })
  },

  /**
   * 搜索：关键词越短返回越慢 —— 专门用来暴露竞态问题。
   * 输入 a → ab → abc，不做处理最终会显示 'a' 的结果。
   */
  async '/search'(req, res, q) {
    const kw = q.kw || ''
    const delay = Math.max(100, 1200 - kw.length * 350)
    log(req, `kw="${kw}" delay=${delay}ms`)
    await sleep(delay)
    ok(res, {
      kw,
      items: Array.from({ length: 8 }, (_, i) => ({ id: `${kw}-${i}`, title: `${kw} 的结果 ${i}` }))
    })
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    })
    return res.end()
  }

  const { pathname, query } = url.parse(req.url, true)
  const handler = routes[pathname]

  if (!handler) {
    log(req, '→ 404')
    return json(res, 404, { code: 40400, message: '接口不存在' })
  }

  try {
    req.body = await readBody(req)
    await handler(req, res, query)
  } catch (e) {
    console.error(e)
    json(res, 500, { code: 50000, message: e.message })
  }
})

server.listen(PORT, () => {
  console.log(`\nMock 服务器已启动： http://localhost:${PORT}\n`)
  console.log('可用路由：')
  Object.keys(routes).forEach(r => console.log('  ' + r))
  console.log('\n开发者工具需勾选「不校验合法域名」。\n')
})
