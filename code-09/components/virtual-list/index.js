/**
 * 定高虚拟列表。
 *
 * 原理：
 *   上方占位(height) + 可视窗口(buffer + 可视区 + buffer) + 下方占位(height)
 *   只有窗口内的节点真实存在，占位 view 负责撑出总高度。
 *
 * 验收：2000 条数据下，节点数必须 < 100
 *   wx.createSelectorQuery().selectAll('*').boundingClientRect(r => console.log(r.length)).exec()
 */
Component({
  properties: {
    items: { type: Array, value: [] },
    itemHeight: { type: Number, value: 200 },   // rpx
    buffer: { type: Number, value: 3 }
  },

  data: { visible: [], padTop: 0, padBottom: 0, height: 0, scrollTop: 0 },

  lifetimes: {
    ready() {
      const { windowHeight } = wx.getWindowInfo()
      this.setData({ height: windowHeight }, () => this.update(0))
    }
  },

  observers: {
    'items': function () { this.update(this._scrollTop || 0) }
  },

  methods: {
    /** TODO-16: rpx → px */
    pxItem() {
      return this.data.itemHeight
    },

    /**
     * TODO-17: 根据 scrollTop 计算可视窗口
     *   start = max(0, floor(scrollTop / h) - buffer)
     *   count = ceil(viewportH / h) + buffer * 2
     *   end   = min(items.length, start + count)
     *   visible 里每项要带原始下标 _i 作为 wx:key
     *   padTop = start * h,  padBottom = max(0, (len - end) * h)
     */
    update(scrollTop) {},

    /**
     * TODO-18: 滚动节流 —— 位移不足半个 item 不重算
     * 快速滑动会白屏，缓解手段见 lab-09 第 4.3 节。
     */
    onScroll(e) {
      this._scrollTop = e.detail.scrollTop
    },

    /** TODO-19: 对外提供 scrollToIndex */
    scrollToIndex(n) {}
  }
})
