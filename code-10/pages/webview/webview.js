const { H5_BASE } = require('../../config')

Component({
  data: { url: '' },

  methods: {
    async onLoad(query) {
      /**
       * 方案 A：URL 直传 token —— 有安全隐患
       * TODO-18: 实现并说明风险（token 会出现在哪些地方？至少列 3 处）
       */
      // const url = `${H5_BASE}/?token=${encodeURIComponent(getToken())}`

      /**
       * 方案 B：一次性 ticket（推荐）
       * TODO-19: 实现
       *   1. 小程序调 POST /h5/ticket，服务端生成 30 秒有效、一次性的 ticket
       *   2. URL 里只带 ticket
       *   3. H5 首次加载用 ticket 换自己的会话，ticket 立即作废
       *
       * 必答：用户 30 秒内没打开页面会怎样？如何优化体验？
       */
      this.setData({ url: `${H5_BASE}/?from=miniprogram&t=${Date.now()}` })
    },

    /**
     * TODO-17: 记录每次 bindmessage 收到的内容与时间
     *
     * ⚠ postMessage **不是实时的**。
     * 只在小程序后退、组件销毁、分享、复制链接时，
     * 才把 H5 累积的所有消息**一次性**传过来。
     *
     * 操作序列（每一步都记录是否收到）：
     *   1. H5 里点按钮 postMessage 一条
     *   2. 再点两次，共 3 条
     *   3. 点右上角「···」→ 分享
     *   4. 点左上角返回
     *   5. 小程序内 navigateTo 离开该页
     */
    onMessage(e) {
      const list = e.detail.data || []
      console.log('[webview] 收到', list.length, '条消息', list)
      wx.showModal({
        title: `收到 ${list.length} 条消息`,
        content: JSON.stringify(list).slice(0, 400),
        showCancel: false
      })
    },

    onWebviewLoad(e) { console.log('[webview] load', e.detail) },
    onError(e) { console.error('[webview] error', e.detail) }
  }
})
