const { BASE_URL, TMPL } = require('../../config')

function req(path, method, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + path,
      method: method || 'GET',
      data,
      header: { 'content-type': 'application/json', 'x-mock-openid': 'mock_openid_default' },
      success: r => resolve(r.data),
      fail: reject
    })
  })
}

Component({
  data: { orderNo: '', balances: [], logs: [] },

  methods: {
    onLoad(q) {
      this.setData({ orderNo: q.id || '202610150001' })
      this.loadBalance()
    },

    push(...a) {
      const line = a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')
      console.log('[sub]', line)
      this.setData({ logs: [line, ...this.data.logs].slice(0, 30) })
    },

    async loadBalance() {
      const r = await req('/subscribe/balance')
      this.setData({ balances: r.data || [] })
    },

    /**
     * TODO-8: 请求订阅，最多 3 个模板
     * TODO-9: 解析结果，只把 'accept' 的告知服务端
     * TODO-10: 用户勾了「总是保持以上选择」并拒绝时，
     *          wx.requestSubscribeMessage 会直接 fail —— 走引导设置流程
     */
    async onSubscribe() {
      const ids = [TMPL.PAID, TMPL.SHIPPED, TMPL.ARRIVED]
      try {
        const res = await wx.requestSubscribeMessage({ tmplIds: ids })
        this.push('订阅结果', res)
        // const accepted = ids.filter(id => res[id] === 'accept')
        // if (accepted.length) { await req('/subscribe', 'POST', { tmplIds: accepted }); this.loadBalance() }
      } catch (e) {
        this.push('requestSubscribeMessage 失败', e.errMsg)
        this.checkSubscription()
      }
    },

    /** TODO-11: 被永久拒绝时引导 openSetting */
    async checkSubscription() {
      const setting = await wx.getSetting({ withSubscriptions: true })
      this.push('订阅设置', setting.subscriptionsSetting)
      // const item = setting.subscriptionsSetting && setting.subscriptionsSetting.itemSettings
      // if (item && item[TMPL.SHIPPED] === 'reject') { ... wx.openSetting({ withSubscriptions: true }) }
    },

    async ship() {
      const r = await req('/debug/ship', 'POST', {
        tmplId: TMPL.SHIPPED,
        data: {
          character_string1: { value: this.data.orderNo },
          thing2: { value: '山大文创帆布包' },
          amount3: { value: '￥59.00' },
          time4: { value: '2026-10-15 14:30' },
          phrase5: { value: '已发货' }
        }
      })
      this.push('推送结果', r)
      this.loadBalance()
    },

    async shipBad() {
      const r = await req('/debug/ship', 'POST', {
        tmplId: TMPL.SHIPPED,
        data: { phrase5: { value: '这是六个汉字啦' } }   // phrase 最多 5 个汉字
      })
      this.push('故意格式错误 →', r)
    }
  }
})
