const { drawPoster, drawPosterOffscreen, saveToAlbum } = require('../../services/poster')

const DATA = {
  cover: 'https://cdn.example.com/goods/1.jpg',
  title: '山东大学文创帆布包 · 百廿校庆限定版 SDU 120th Anniversary',
  priceInCent: 5900,
  qrcode: 'https://cdn.example.com/qr.png',
  nickname: '张同学',
  avatar: 'https://cdn.example.com/avatar.png'
}

const TEXT_CASES = [
  '纯中文：山东大学百廿校庆纪念文创商品限量发售',
  '纯英文：Shandong University 120th Anniversary Limited Edition Canvas Bag',
  '中英混排：SDU 山大 120th 校庆 Limited 帆布包',
  '含 emoji：山大文创 🎒 限定款 ✨'
]

Component({
  data: { preview: '', ms: 0, busy: false, noDpr: false, cases: TEXT_CASES },

  methods: {
    onDpr(e) { this.setData({ noDpr: e.detail.value }) },

    async gen() {
      this.setData({ busy: true })
      const t0 = Date.now()
      try {
        const { tempFilePath } = await drawPoster(this, DATA)
        this._path = tempFilePath
        this.setData({ preview: tempFilePath, ms: Date.now() - t0 })
      } catch (e) {
        wx.showModal({ title: '生成失败', content: e.message, showCancel: false })
      } finally {
        this.setData({ busy: false })
      }
    },

    async genOffscreen() {
      const t0 = Date.now()
      try {
        const { tempFilePath } = await drawPosterOffscreen(DATA)
        this._path = tempFilePath
        this.setData({ preview: tempFilePath, ms: Date.now() - t0 })
      } catch (e) {
        wx.showModal({ title: '离屏生成失败', content: e.message, showCancel: false })
      }
    },

    async save() {
      if (!this._path) return wx.showToast({ title: '请先生成', icon: 'none' })
      const r = await saveToAlbum(this._path)
      wx.showToast({ title: r.saved ? '已保存' : '未保存：' + r.reason, icon: 'none' })
    }
  }
})
