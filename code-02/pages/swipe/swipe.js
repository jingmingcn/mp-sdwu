const SIZES = [50, 500, 2000]
const MAX_RPX = -160

function make(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i, title: `待办事项 ${i}` }))
}

function rpx2px(rpx) {
  return rpx * wx.getWindowInfo().windowWidth / 750
}

Component({
  data: {
    mode: 'logic',
    sizes: SIZES,
    sizeIndex: 0,
    list: make(SIZES[0]),
    offsets: {}
  },

  methods: {
    onModeChange(e) { this.setData({ mode: e.detail.value, offsets: {} }) },

    onSizeChange(e) {
      const sizeIndex = Number(e.detail.value)
      this.setData({ sizeIndex, list: make(SIZES[sizeIndex]), offsets: {} })
    },

    // ── 逻辑层实现（作为对照的「坏」版本）──
    onTouchStart(e) {
      this._startX = e.touches[0].pageX
      this._index = e.currentTarget.dataset.index
      this._origin = this.data.offsets[this._index] || 0
      this._max = rpx2px(MAX_RPX)
    },

    onTouchMove(e) {
      // TODO-9: 计算位移并 setData 到 offsets[index]
      //   每次 touchmove 都 setData —— 这正是要对比的「坏」实现
      //   const dx = e.touches[0].pageX - this._startX
      //   const x = Math.max(this._max, Math.min(0, this._origin + dx))
      //   this.setData({ [`offsets[${this._index}]`]: x })
    },

    onTouchEnd() {
      // TODO-10: 吸附到 0 或 this._max（位移过半则打开）
      //          并关闭其他已打开的行
    },

    // ── WXS 版本通过 callMethod 回调这里 ──
    onSwipeEnd({ index, open }) {
      // 互斥：打开一行时关闭其他行
      this._openIndex = open ? index : -1
    },

    async confirmDelete(e) {
      const id = e.currentTarget.dataset.id
      const { confirm } = await wx.showModal({ title: '确认删除？', content: `事项 ${id}` })
      if (!confirm) return
      this.setData({ list: this.data.list.filter(x => x.id !== id), offsets: {} })
    },

    /** TODO-15: 每 100ms 跑 30ms 的同步计算，持续 5 秒 —— 模拟逻辑层繁忙 */
    makeBusy() {
      wx.showToast({ title: '逻辑层繁忙中', icon: 'none' })
      this._busy = setInterval(() => {
        const end = Date.now() + 30
        while (Date.now() < end) { /* 空转 */ }
      }, 100)
      setTimeout(() => clearInterval(this._busy), 5000)
    },

    onUnload() { clearInterval(this._busy) }
  }
})
