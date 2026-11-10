require('./request/setup')
const { ensureLogin } = require('./services/auth')

App({
  onLaunch() {
    /**
     * TODO-18: 静默登录但不阻塞首屏。
     *
     * 把登录 Promise 挂在 App 上，页面 await getApp().loginReady 时复用同一个 ——
     * 这是避免「登录风暴」最简单的办法。
     *
     * 验证：5 个页面同时 await，服务器日志里 /auth/login 只应出现 1 次。
     */
    this.loginReady = ensureLogin().catch(e => {
      console.error('[auth] 静默登录失败', e && e.message)
      return null
    })
  }
})
