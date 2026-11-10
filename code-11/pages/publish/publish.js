const svc = require('../../services/message')
const { compress, uploadImages } = require('../../services/upload')

Component({
  data: { content: '', images: [], busy: false, uploading: false, percent: 0 },

  methods: {
    onInput(e) { this.setData({ content: e.detail.value }) },

    async chooseImages() {
      const rest = 9 - this.data.images.length
      const { tempFiles } = await wx.chooseMedia({ count: rest, mediaType: ['image'] })
      // 选完立即压缩，不要等到上传时才做
      const paths = await Promise.all(tempFiles.map(f => compress(f.tempFilePath)))
      this.setData({ images: this.data.images.concat(paths) })
    },

    removeImage(e) {
      const i = Number(e.currentTarget.dataset.index)
      this.setData({ images: this.data.images.filter((_, k) => k !== i) })
    },

    async submit() {
      const content = (this.data.content || '').trim()
      if (!content) return wx.showToast({ title: '请输入内容', icon: 'none' })
      if (content.length > 500) return wx.showToast({ title: '最多 500 字', icon: 'none' })

      this.setData({ busy: true })
      try {
        this.setData({ uploading: true, percent: 0 })
        const fileIDs = await uploadImages(this.data.images, p => this.setData({ percent: p }))
        this.setData({ uploading: false })

        await svc.create(content, fileIDs)
        wx.showToast({ title: '已提交，审核中', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 800)
      } catch (e) {
        wx.showModal({ title: '发布失败', content: e.message, showCancel: false })
      } finally {
        this.setData({ busy: false, uploading: false })
      }
    }
  }
})
