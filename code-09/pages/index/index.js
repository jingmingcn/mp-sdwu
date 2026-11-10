const api = require('../../services/api')
const { mark, measure } = require('../../utils/perf')
const { monitorSetData, dumpSetData } = require('../../utils/setdata-monitor')
const { imgUrl } = require('../../utils/image')

/** 只保留渲染需要的字段 —— L1 用 */
function pick(it) {
  return {
    id: it.id,
    title: it.title,
    priceText: '￥' + (it.priceInCent / 100).toFixed(2),
    cover: imgUrl(it.cover, 80)
  }
}

Component({
  data: {
    level: 'L0',
    list: [],
    loading: true,
    page: 1,
    hasMore: true,
    firstPaint: 0,
    nodeCount: 0
  },

  lifetimes: {
    attached() { monitorSetData(this, 'index') }
  },

  methods: {
    async onLoad() {
      mark('page:load')
      await this.reload()
    },

    onLevel(e) {
      this.setData({ level: e.detail.value, list: [], page: 1, hasMore: true }, () => this.reload())
    },

    async reload() {
      this.setData({ loading: true })
      const level = this.data.level

      // TODO-22: 接入 SWR —— 二次进入应 0ms 出内容
      // const cached = getItem('home:feed')
      // if (cached) this.setData({ list: cached, loading: false })

      if (level === 'L0') {
        // ⚠ 基线：2000 条全量 + 冗余字段
        const { items } = await api.feed(1, 2000)
        this.setData({ list: items, loading: false }, () => {
          this.setData({ firstPaint: measure('L0 首屏', 'page:load') })
        })
      } else if (level === 'L1') {
        // TODO-13: 字段裁剪
        const { items } = await api.feed(1, 2000)
        this.setData({ list: items.map(pick), loading: false }, () => {
          this.setData({ firstPaint: measure('L1 首屏', 'page:load') })
        })
      } else if (level === 'L2') {
        // TODO-14: 分页 + 增量追加（用数据路径，不要整表重传）
        this.setData({ list: [], page: 1, hasMore: true, loading: false })
        await this.loadMore()
      } else {
        // TODO-15: 虚拟列表 —— 数据仍是 2000 条，但只渲染可视区
        const { items } = await api.feed(1, 2000)
        this.setData({ list: items.map(pick), loading: false }, () => {
          this.setData({ firstPaint: measure('L3 首屏', 'page:load') })
        })
      }
    },

    async loadMore() {
      if (!this.data.hasMore) return
      const { items, total } = await api.feed(this.data.page, 20)
      const start = this.data.list.length

      // TODO-14: 用数据路径增量追加，一次 setData 只传新增部分
      // const patch = { page: this.data.page + 1, hasMore: start + items.length < total }
      // items.forEach((it, i) => { patch[`list[${start + i}]`] = pick(it) })
      // this.setData(patch)

      this.setData({
        list: this.data.list.concat(items.map(pick)),     // ✗ 整表重传
        page: this.data.page + 1,
        hasMore: start + items.length < total
      })
    },

    dumpStat() { dumpSetData(this, 'index') },

    countNodes() {
      wx.createSelectorQuery().in(this).selectAll('*').boundingClientRect(rects => {
        this.setData({ nodeCount: (rects || []).length })
      }).exec()
    },

    /**
     * ⚠ 问题 9：跳转前 await 接口，用户会觉得点了没反应。
     *
     * TODO-23: 立即跳转，并把列表页已有的简要数据传过去
     * TODO-24: 详情页先用简要数据渲染，再补全（见 pages/detail）
     */
    async goDetail(e) {
      const id = e.currentTarget.dataset.id
      await api.detail(id)                                  // ✗ 阻塞
      wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
    },

    /** TODO-25: 点赞的乐观更新 + 回滚 + 并发保护 */
    async toggleLike(e) {
      // 1. 若该 id 已有在途请求，忽略本次点击（或取消上一次）
      // 2. 立即改 UI
      // 3. 失败则回滚，并 toast
      // 4. 回滚时列表可能已经变了，要按 id 找而不是按下标
    },

    onReachBottom() { if (this.data.level === 'L2') this.loadMore() }
  }
})
