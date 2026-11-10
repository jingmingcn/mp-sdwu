const { list } = require('../../services/goods')

Component({
  behaviors: [require('../../behaviors/with-cart')],

  data: { goods: [] },

  methods: {
    async onLoad() {
      const goods = await list()
      this.setData({
        goods: goods.map(g => Object.assign({}, g, { priceText: (g.priceInCent / 100).toFixed(2) }))
      })
      this._raw = goods   // 原始数据挂实例，不进 data
    },

    onAdd(e) {
      const index = Number(e.currentTarget.dataset.index)
      this.add(this._raw[index])          // add 来自 with-cart behavior
      wx.showToast({ title: '已加入', icon: 'success' })
    }
  }
})
