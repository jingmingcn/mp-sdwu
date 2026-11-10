const svc = require('../../services/message')

const STATUS_TEXT = { pending: '审核中', published: '已发布', rejected: '未通过' }

Component({
  data: { list: [] },

  methods: {
    onShow() { this.reload() },

    async reload() {
      const { items } = await svc.list({ mine: true, size: 20 })
      this.setData({
        list: items.map(m => Object.assign({}, m, { statusText: STATUS_TEXT[m.status] || m.status }))
      })
    },

    async onRemove(e) {
      const { confirm } = await wx.showModal({ title: '确认删除？', content: '关联的图片也会一并清理' })
      if (!confirm) return
      try {
        await svc.remove(e.currentTarget.dataset.id)
        this.reload()
      } catch (err) {
        wx.showToast({ title: err.message, icon: 'none' })
      }
    }
  }
})
