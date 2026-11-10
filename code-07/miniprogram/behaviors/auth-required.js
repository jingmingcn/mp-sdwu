const auth = require('../services/auth')

/**
 * 页面级鉴权。
 *
 * 注意：前端的权限控制只是**体验优化**。
 *       每一个接口都必须在服务端独立鉴权 —— 这条没有例外。
 */
module.exports = Behavior({
  data: { _authReady: false },

  lifetimes: {
    async attached() {
      // TODO-20:
      // 1. 已有 access token → 直接放行
      // 2. 无 token → 尝试静默登录
      // 3. 静默登录失败（需要用户交互）→ _rememberRedirect() 后跳登录页
      // 4. 放行后 setData({ _authReady: true }) 并调用 this.onAuthReady()
    }
  },

  methods: {
    /**
     * TODO-21: 记录当前页面完整路径（含 query），登录成功后要回来
     *   提示：getCurrentPages() 的最后一项有 route 与 options
     */
    _rememberRedirect() {
      // const pages = getCurrentPages()
      // const cur = pages[pages.length - 1]
      // const qs = Object.keys(cur.options || {}).map(k => `${k}=${cur.options[k]}`).join('&')
      // auth.setRedirect('/' + cur.route + (qs ? '?' + qs : ''))
    }
  }
})
