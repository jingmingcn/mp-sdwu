const svc = require('../../services/message')
const { toThumbUrls } = require('../../services/upload')

Component({
  data: { list: [], cursor: null, hasMore: true, ms: 0, pageMode: 'cursor' },

  methods: {
    onLoad() { this.reload() },

    onPageMode(e) {
      this.setData({ pageMode: e.detail.value }, () => this.reload())
    },

    async reload() {
      this.setData({ list: [], cursor: null, hasMore: true })
      await this.loadMore()
    },

    /**
     * 两种分页对比（TODO-4）：
     *   skip + limit —— 页码越大越慢；数据变动时会漏/重
     *   游标         —— 恒定速度；但无法跳页
     */
    async loadMore() {
      if (!this.data.hasMore) return
      const t0 = Date.now()

      const { items, nextCursor } = this.data.pageMode === 'cursor'
        ? await svc.list({ cursor: this.data.cursor, size: 20 })
        : { items: await svc.pageBySkip(Math.floor(this.data.list.length / 20) + 1, 20), nextCursor: null }

      // 图片一律用缩略图 —— 原图直出会让流量费用与加载时间都失控
      const withThumbs = await Promise.all(items.map(async m => Object.assign({}, m, {
        thumbs: await toThumbUrls(m.images || [], 200),
        timeText: fmtTime(m.createdAt)
      })))

      const start = this.data.list.length
      const patch = {
        cursor: nextCursor,
        hasMore: this.data.pageMode === 'cursor' ? !!nextCursor : items.length === 20,
        ms: Date.now() - t0
      }
      withThumbs.forEach((m, i) => { patch[`list[${start + i}]`] = m })
      this.setData(patch)
    },

    async onLike(e) {
      const id = e.currentTarget.dataset.id
      const idx = this.data.list.findIndex(m => m._id === id)
      if (idx < 0) return

      // 乐观更新：先改 UI，失败再回滚
      const old = this.data.list[idx]
      this.setData({
        [`list[${idx}].liked`]: !old.liked,
        [`list[${idx}].likeCount`]: old.likeCount + (old.liked ? -1 : 1)
      })
      try {
        await svc.like(id)
      } catch (err) {
        this.setData({ [`list[${idx}].liked`]: old.liked, [`list[${idx}].likeCount`]: old.likeCount })
        wx.showToast({ title: err.message, icon: 'none' })
      }
    },

    preview(e) {
      wx.previewImage({ urls: e.currentTarget.dataset.urls, current: e.currentTarget.dataset.src })
    },

    goDetail(e) { wx.navigateTo({ url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id }) },
    go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) },
    onReachBottom() { this.loadMore() }
  }
})

function fmtTime(d) {
  const t = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(t.getTime())) return ''
  const p = n => (n < 10 ? '0' : '') + n
  return `${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`
}
