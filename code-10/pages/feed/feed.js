const VIDEO = 'https://storage.360buyimg.com/jdc-article/watermark.mp4'

const LIST = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  title: `视频 ${i} · 山大校园记录`,
  url: VIDEO,
  cover: `https://cdn.example.com/cover/${i % 10}.jpg`
}))

Component({
  data: { mode: 'each', list: LIST, playingIndex: -1, videoTop: 0 },

  methods: {
    onMode(e) {
      this.setData({ mode: e.detail.value, playingIndex: -1 })
    },

    /**
     * TODO-12: 方案 B —— 只有一个 video，跟随当前播放项移动
     *
     * 1. 列表项默认显示封面图 + 播放按钮
     * 2. 点击时用 SelectorQuery 量出该项的位置
     * 3. 把唯一的 video 绝对定位到那个位置并播放
     * 4. 滚动出可视区时暂停并隐藏（用 IntersectionObserver）
     */
    async onPlay(e) {
      const index = Number(e.currentTarget.dataset.index)
      const rect = await this.rectOf(`#item-${index}`)
      if (!rect) return
      this.setData({ playingIndex: index, videoTop: rect.top }, () => {
        this.ctx = this.ctx || wx.createVideoContext('player', this)
        this.ctx.play()
      })
    },

    rectOf(sel) {
      return new Promise(resolve => {
        this.createSelectorQuery().select(sel).boundingClientRect(resolve).exec()
      })
    },

    onEnded() { this.setData({ playingIndex: -1 }) },

    /**
     * TODO-13: 生命周期管理
     *
     * 必做验证：
     *   1. 播放时按 Home 键切后台，声音还在响吗？
     *   2. 切到其他页面，声音停了吗？
     *   3. 如果不停，用户会怎么想？
     */
    pageLifetimes: {},

    onUnload() {
      this.ctx && this.ctx.stop()
      this.ctx = null
      this._observer && this._observer.disconnect()
    }
  },

  pageLifetimes: {
    hide() {
      // TODO-13: 页面隐藏时暂停
    },
    show() {
      // TODO-13: 是否要恢复？想清楚用户预期
    }
  }
})
