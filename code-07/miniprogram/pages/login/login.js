const auth = require('../../services/auth')

const TAB_PAGES = []   // 若有 tabBar 页，把路径列在这里

Component({
  data: { loading: false },

  methods: {
    /**
     * TODO-22: 完成登录后回到来源页
     *
     * 注意：
     *   来源页可能是 tabBar 页（要用 switchTab）也可能是普通页（redirectTo）
     *   来源页可能已经在页面栈里 —— 想想用 navigateBack 还是 redirectTo
     *   query 不能丢
     */
    async onLoginTap() {
      this.setData({ loading: true })
      try {
        await auth.login()
        const redirect = auth.takeRedirect()
        // ...
      } catch (e) {
        wx.showToast({ title: e.userMessage || '登录失败', icon: 'none' })
      } finally {
        this.setData({ loading: false })
      }
    },

    cancel() { wx.navigateBack() }
  }
})
