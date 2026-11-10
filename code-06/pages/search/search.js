const http = require('../../request')
require('../../request/setup')
const { RequestSignal } = require('../../request/signal')

Component({
  data: { kw: '', resultKw: '-', list: [], mode: 'none' },

  methods: {
    onMode(e) { this.setData({ mode: e.detail.value }) },

    /**
     * TODO-20: 输入时先 abort 上一次，再发新请求
     * TODO-21: 同时用序号法丢弃过期结果
     *
     * 必答：只用 abort 时还存在什么漏洞？
     *       （提示：abort 发出到真正生效之间有时间窗口）
     */
    onInput(e) {
      const kw = e.detail.value
      this.setData({ kw })
      if (!kw) return this.setData({ list: [], resultKw: '-' })

      const mode = this.data.mode
      const useAbort = mode === 'abort' || mode === 'both'
      const useSeq = mode === 'seq' || mode === 'both'

      if (useAbort && this._signal) this._signal.abort()
      this._signal = new RequestSignal()
      const seq = ++this._seq || (this._seq = 1)

      http.get('/search', { kw }, {
        signal: useAbort ? this._signal : undefined,
        dedupe: false,
        retry: false,
        loading: false
      })
        .then(res => {
          if (useSeq && seq !== this._seq) {
            return console.log('[search] 丢弃过期结果', res.kw)
          }
          this.setData({ list: res.items, resultKw: res.kw })
        })
        .catch(err => {
          if (err.type !== 'ABORT') console.error('[search]', err.message)
        })
    }
  }
})
