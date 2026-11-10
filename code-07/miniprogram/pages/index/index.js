const http = require('../../request')
const auth = require('../../services/auth')

Component({
  data: { tokenBrief: '-', user: {}, logs: [] },

  methods: {
    onShow() { this.refresh() },

    push(...a) {
      const line = a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')
      console.log('[idx]', line)
      this.setData({ logs: [line, ...this.data.logs].slice(0, 40) })
    },

    refresh() {
      const t = auth.getAccess()
      this.setData({
        tokenBrief: t ? t.slice(0, 12) + '…' : '（无）',
        user: auth.getUser() || {}
      })
    },

    async doLogin() {
      try { await auth.login(); this.push('登录成功'); this.refresh() }
      catch (e) { this.push('登录失败', e.message) }
    },

    async doLogout() {
      await auth.logout(); this.push('已登出'); this.refresh()
    },

    async expire() {
      try { await http.post('/debug/expire-token'); this.push('token 已失效') }
      catch (e) { this.push('失败', e.message) }
    },

    async burst6() {
      const t0 = Date.now()
      try {
        const rs = await Promise.all(Array.from({ length: 6 }, () => http.get('/profile')))
        this.push(`✓ 6 个请求全部成功 ${Date.now() - t0}ms —— 去服务器日志看 /auth/refresh 几条`)
      } catch (e) {
        this.push('✗ 失败', e.type, e.message)
      }
    },

    async reuseCode() {
      const { code } = await auth.wxLogin()
      this.push('拿到 code', code.slice(0, 10) + '…')
      try {
        await http.post('/auth/login', { code }, { _skipAuth: true })
        this.push('第 1 次: 成功')
      } catch (e) { this.push('第 1 次: 失败', e.code, e.message) }
      try {
        await http.post('/auth/login', { code }, { _skipAuth: true })
        this.push('第 2 次: 成功（不应该出现）')
      } catch (e) { this.push('第 2 次: 失败', e.code, e.message) }
    },

    go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) }
  }
})
