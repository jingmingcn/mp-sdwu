const api = require('../../services/api')

Component({
  data: { goods: {}, partial: false },

  methods: {
    /**
     * TODO-24: 用列表页已有的简要数据做首屏
     *
     * 这个技巧能把详情页的「感知首屏」从 600ms+ 降到接近 0。
     */
    async onLoad({ id }) {
      // const brief = getApp().briefCache && getApp().briefCache[id]
      // if (brief) this.setData({ goods: brief, partial: true })

      const full = await api.detail(id)
      this.setData({
        goods: Object.assign({}, full, { priceText: '￥' + (full.priceInCent / 100).toFixed(2) }),
        partial: false
      })
    }
  }
})
