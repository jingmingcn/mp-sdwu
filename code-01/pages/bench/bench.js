const { mock } = require('../../services/mock')
const { median } = require('../../utils/perf')

/**
 * setData 基准测试。
 *
 * 要得出的结论：
 *   1. 条数 vs 体积，哪个是主导因素？
 *   2. 数据路径相比全量传能省多少？
 *   3. 单次跨线程通信的固定开销大约是多少？
 */
Component({
  data: { list: [], results: [], running: false },

  methods: {
    /** 测一次 setData 的往返耗时：回调在渲染层完成渲染后触发 */
    measureOnce(payload) {
      return new Promise(resolve => {
        const t0 = Date.now()
        this.setData(payload, () => resolve(Date.now() - t0))
      })
    },

    reset() {
      return new Promise(resolve => this.setData({ list: [] }, resolve))
    },

    async runCase({ name, build }) {
      await this.reset()
      const payload = build()
      const size = JSON.stringify(payload).length
      const ms = await median(async () => {
        await this.reset()
        return this.measureOnce(build())
      })
      return { name, size, ms }
    },

    /** 用例 F 特殊处理：对比「连续 3 次」与「合并 1 次」 */
    async runCaseF() {
      await this.reset()
      const t0 = Date.now()
      await this.measureOnce({ 'list[0].title': 'a' })
      await this.measureOnce({ 'list[0].priceInCent': 1 })
      await this.measureOnce({ 'list[0].id': 0 })
      const three = Date.now() - t0

      await this.reset()
      await this.measureOnce({ list: mock(100, 'lean') })
      const t1 = Date.now()
      await this.measureOnce({ 'list[0].title': 'a', 'list[0].priceInCent': 1, 'list[0].id': 0 })
      const one = Date.now() - t1

      return { name: 'F 3次 vs 1次', size: three - one, ms: `${three}/${one}` }
    },

    async runAll() {
      if (this.data.running) return
      this.setData({ running: true, results: [] })

      // TODO-7: 补全 CASES
      const CASES = [
        { name: 'A 100 精简', build: () => ({ list: mock(100, 'lean') }) },
        { name: 'B 100 冗余', build: () => ({ list: mock(100, 'fat') }) },
        // TODO: C 2000 精简
        // TODO: D 2000 冗余
        // TODO: E 数据路径改 1 个字段（提示：先铺好 list，再只改 list[0].title）
      ]

      const results = []
      for (const c of CASES) results.push(await this.runCase(c))
      results.push(await this.runCaseF())

      const base = results[0].ms || 1
      results.forEach(r => {
        r.ratio = typeof r.ms === 'number' ? (r.ms / base).toFixed(1) : '-'
      })

      console.table && console.table(results)
      this.setData({ results, running: false })
    },

    clear() { this.setData({ results: [], list: [] }) }
  }
})
