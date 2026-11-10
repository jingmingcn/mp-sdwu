const { getEntryContext } = require('../../utils/attribution')

Component({
  data: { entry: {}, queryText: '' },
  methods: {
    onLoad() {
      const opts = wx.getLaunchOptionsSync()
      this.setData({
        entry: getEntryContext() || {},
        queryText: JSON.stringify(opts.query || {})
      })
    },
    go(e) { wx.navigateTo({ url: e.currentTarget.dataset.url }) }
  }
})
