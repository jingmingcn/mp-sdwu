let seq = 0

Component({
  data: {
    current: 0,
    lastChange: '-',
    exported: '-',
    dynTabs: [{ id: 1, title: '动态 1' }, { id: 2, title: '动态 2' }],
    texts: ['很差', '较差', '一般', '满意', '非常满意']
  },

  methods: {
    onTabChange(e) {
      this.setData({ lastChange: JSON.stringify(e.detail) })
    },

    onDynChange(e) { console.log('[demo] 动态 tabs change', e.detail) },

    tabs() { return this.selectComponent('#tabs') },

    callNext() { this.tabs().next(); this.refresh() },
    callPrev() { this.tabs().prev(); this.refresh() },
    callSwitchTo2() { this.tabs().switchTo(2); this.refresh() },
    refresh() { this.setData({ exported: String(this.tabs().getCurrent()) }) },

    /**
     * TODO-7: 验证 component-export 的封装边界
     * 期望：switchTo 是 function；setData / data / activate 都是 undefined
     */
    verifyExport() {
      const t = this.tabs()
      const report = {
        switchTo: typeof t.switchTo,
        getCurrent: typeof t.getCurrent,
        setData: typeof t.setData,
        data: typeof t.data,
        activate: typeof t.activate,
        syncTabs: typeof t.syncTabs
      }
      console.table ? console.table(report) : console.log(report)
      wx.showModal({ title: '封装边界', content: JSON.stringify(report), showCancel: false })
    },

    addTab() {
      const id = Date.now() + (++seq)
      this.setData({ dynTabs: [...this.data.dynTabs, { id, title: '动态 ' + (this.data.dynTabs.length + 1) }] })
    },

    removeTab() {
      this.setData({ dynTabs: this.data.dynTabs.slice(0, -1) })
    }
  }
})
