const GOODS = {
  1: { id: 1, title: '山大文创帆布包', price: '59.00', cover: 'https://cdn.example.com/g1.jpg' },
  2: { id: 2, title: '校徽金属书签', price: '19.00', cover: 'https://cdn.example.com/g2.jpg' }
}

Component({
  data: { goods: {}, fromText: '-', singlePage: false, stackLen: 0 },

  methods: {
    onLoad(query) {
      const goods = GOODS[query.id] || GOODS[1]

      /** TODO-7: 检测并适配单页模式 */
      const { mode } = wx.getLaunchOptionsSync()
      const singlePage = mode === 'singlePage'

      this.setData({
        goods,
        singlePage,
        stackLen: getCurrentPages().length,
        fromText: query.from ? `${query.from}${query.uid ? ' by ' + query.uid : ''}` : '直接进入'
      })

      if (query.from === 'share' && query.uid) {
        console.log('[归因] 分享打开', { goodsId: query.id, inviterId: query.uid })
        this._inviterId = query.uid   // 下单时带上，用于分佣
      }
    },

    /**
     * TODO-1: 区分 res.from
     *   'button' → 从 res.target.dataset 取商品信息
     *   'menu'   → 用当前页面的商品
     * TODO-2: path 必须带来源标识：from=share & uid & ts
     * TODO-3: imageUrl 用商品主图（5:4，建议 500x400）
     */
    onShareAppMessage(res) {
      return { title: '', path: '/pages/index/index', imageUrl: '' }
    },

    /** TODO-4: 注意只有 query 没有 path */
    onShareTimeline() {
      return { title: '', query: '', imageUrl: '' }
    },

    buy() {
      if (this.data.singlePage) {
        return wx.showModal({ title: '提示', content: '请前往小程序完成购买', showCancel: false })
      }
      wx.navigateTo({ url: '/pages/order/success?id=' + Date.now() })
    }
  }
})
