const { ComponentWithStore } = require('mobx-miniprogram-bindings')
const { cartStore } = require('../../stores/cart')

ComponentWithStore({
  storeBindings: {
    store: cartStore,
    // TODO-14: 只绑渲染真正需要的字段
    //   注意 viewList 而不是 items —— 对比两者的 setData 字节数
    fields: ['viewList', 'count', 'totalText', 'allChecked'],
    actions: ['setQty', 'toggle', 'toggleAll', 'remove', 'clearChecked']
  },

  methods: {
    onLoad() {
      // TODO-16: 劫持 setData 统计字节数，用于对比 fields: ['items'] 与 ['viewList']
      const origin = this.setData.bind(this)
      this.setData = (data, cb) => {
        const size = JSON.stringify(data).length
        console.log('[setData]', size, 'bytes', Object.keys(data).join(','))
        return origin(data, cb)
      }
    },

    onStep(e) { this.setQty(e.currentTarget.dataset.id, e.detail.value) },
    onToggle(e) { this.toggle(e.currentTarget.dataset.id) },
    onToggleAll() { this.toggleAll(!this.data.allChecked) },

    async onRemove(e) {
      const { confirm } = await wx.showModal({ title: '确认删除？' })
      if (confirm) this.remove(e.currentTarget.dataset.id)
    },

    // TODO-15: 校验有勾选项，然后清空已勾选并提示
    onCheckout() {
      // if (!cartStore.checkedItems.length) return wx.showToast({ title: '请先选择商品', icon: 'none' })
      // ...
    }
  }
})
