const svc = require('../../services/message')

Component({
  data: { msg: {}, comments: [], draft: '' },

  methods: {
    async onLoad({ id }) {
      this._id = id
      const { data } = await svc.db().collection('messages').doc(id).get()
      this.setData({ msg: data })
      await this.loadComments()
    },

    async loadComments() {
      const { data } = await svc.db().collection('comments')
        .where({ messageId: this._id, status: 'published' })
        .orderBy('createdAt', 'asc')
        .limit(20)
        .get()
      this.setData({ comments: data })
    },

    onInput(e) { this.setData({ draft: e.detail.value }) },

    async send() {
      const content = (this.data.draft || '').trim()
      if (!content) return
      try {
        await svc.comment(this._id, content)
        this.setData({ draft: '' })
        await this.loadComments()
      } catch (e) {
        wx.showToast({ title: e.message, icon: 'none' })
      }
    }
  }
})
