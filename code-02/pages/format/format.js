const { mock } = require('../../services/mock')
const { pad2 } = require('../../utils/format')

const N = 200

Component({
  data: { mode: '', list: [], size: 0, ms: 0 },

  methods: {
    async apply(mode, list) {
      const payload = { mode, list }
      const size = JSON.stringify(payload).length
      const t0 = Date.now()
      this.setData(payload, () => this.setData({ size, ms: Date.now() - t0 }))
    },

    /** 方案 A：逻辑层把 priceText / titleShort / timeText / stockClass 全算好 */
    runA() {
      const list = mock(N, 'lean').map(it => ({
        id: it.id,
        titleShort: it.title.length > 12 ? it.title.slice(0, 12) + '…' : it.title,
        priceText: '￥' + (it.priceInCent / 100).toFixed(2),
        timeText: this.fmtTime(it.createdAt),
        stockClass: it.stock === 0 ? 'sold-out' : it.stock < 10 ? 'low' : ''
      }))
      this.apply('A', list)
    },

    /** 方案 B：只传原始字段，格式化交给 WXS */
    runB() {
      this.apply('B', mock(N, 'lean'))
    },

    runC() {
      this.apply('C', mock(N, 'lean'))
    },

    fmtTime(ts) {
      const d = new Date(ts)
      return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
    }
  }
})
