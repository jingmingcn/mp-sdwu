const http = require('../../request')
require('../../request/setup')
const { RequestSignal } = require('../../request/signal')
const { cacheFirst, networkFirst, swr } = require('../../services/cache')
const { getItem } = require('../../utils/storage')

const LIMITS = [2, 6, 10]

Component({
  data: { logs: [], limits: LIMITS, limitIndex: 1 },

  methods: {
    push(...args) {
      const line = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      console.log('[pg]', line)
      this.setData({ logs: [line, ...this.data.logs].slice(0, 60) })
    },

    onLimit(e) {
      const limitIndex = Number(e.detail.value)
      http.queue.limit = LIMITS[limitIndex]
      this.setData({ limitIndex })
      this.push('并发上限改为', LIMITS[limitIndex])
    },

    async run(e) {
      const c = e.currentTarget.dataset.case
      const t0 = Date.now()
      try {
        const r = await this[c]()
        this.push(`✓ ${c} ${Date.now() - t0}ms`, r === undefined ? '' : r)
      } catch (err) {
        this.push(`✗ ${c} ${Date.now() - t0}ms type=${err.type} msg=${err.message}`)
      }
    },

    // ── ① ──
    normal() { return http.get('/goods', { page: 1, size: 3 }) },

    async concurrent() {
      const rs = await Promise.all([1, 2, 3, 4, 5].map(p => http.get('/goods', { page: p })))
      return `${rs.length} 个完成`
    },

    timeout() { return http.get('/slow', { ms: 15000 }, { timeout: 3000, retry: false }) },
    http404() { return http.get('/not-exist', {}, { retry: false }) },
    http500() { return http.get('/flaky', { rate: 1 }, { retry: false }) },
    biz() { return http.get('/biz-error', {}, { retry: false }) },

    abort() {
      const signal = new RequestSignal()
      const p = http.get('/slow', { ms: 3000 }, { signal, retry: false })
      signal.abort()
      return p
    },

    // ── ② ──
    retry() { return http.get('/flaky', { rate: 0.7 }, { retry: 2 }) },

    async login() {
      const { token } = await http.post('/auth/login', { code: 'mock' }, { _skipAuth: true })
      wx.setStorageSync('auth:token', token)
      return token
    },

    expire() { return http.post('/debug/expire-token', {}, { _skipAuth: true }) },

    async refresh6() {
      const rs = await Promise.all(Array.from({ length: 6 }, () => http.get('/secure', {}, { dedupe: false })))
      return `${rs.length} 个全部成功`
    },

    // ── ③ ──
    async parallel20() {
      const rs = await Promise.all(Array.from({ length: 20 }, () => http.get('/slow', { ms: 1000 }, { dedupe: false })))
      return `${rs.length} 个完成`
    },

    async dedupe() {
      const [a, b, c] = await Promise.all([
        http.get('/goods', { page: 1 }),
        http.get('/goods', { page: 1 }),
        http.get('/goods', { page: 1 })
      ])
      return `a===b: ${a === b}, b===c: ${b === c}（服务器日志应只有 1 条）`
    },

    // ── ④ ──
    cacheFirst() { return cacheFirst('cf:feed', () => http.get('/slow', { ms: 1500 }), 300000) },
    networkFirst() { return networkFirst('nf:feed', () => http.get('/slow', { ms: 1500 }), 300000) },
    swr() {
      return swr('swr:feed', () => http.get('/slow', { ms: 1500 }), {
        ttl: 300000,
        onUpdate: fresh => this.push('[swr] 后台刷新完成', fresh && fresh.at)
      })
    },

    clearCache() {
      wx.clearStorageSync()
      this.push('缓存已清空')
    },

    goSearch() { wx.navigateTo({ url: '/pages/search/search' }) }
  }
})
