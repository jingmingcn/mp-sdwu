Component({
  data: {
    uncontrolledValue: 3,
    controlled: 3,
    texts: ['很差', '较差', '一般', '满意', '非常满意']
  },

  methods: {
    onUncontrolled(e) {
      // 非受控：组件已经自己改好了，父级只是知道一下
      this.setData({ uncontrolledValue: e.detail.value })
    },

    onControlled(e) {
      // 受控：必须由父级写回，组件才会变
      this.setData({ controlled: e.detail.value })
    },

    onRejected(e) {
      // 受控但父级拒绝更新 —— 界面必须保持在 2
      console.log('[demo] 收到 change 但不更新', e.detail.value)
      wx.showToast({ title: `收到 ${e.detail.value}，但父级不更新`, icon: 'none' })
    },

    onHalf(e) { console.log('[demo] 半星', e.detail.value) },

    reset() { this.setData({ controlled: 0 }) }
  }
})
