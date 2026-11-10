let seq = 100
const nextId = () => ++seq

function make(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `第 ${i + 1} 项`,
    checked: false
  }))
}

Component({
  data: { list: make(5), ms: 0 },

  methods: {
    /**
     * TODO-8: 记录一次 setData 的耗时，用于对比有无 key 的性能差异。
     * 提示：setData 的回调在渲染层完成后触发。
     */
    measure(next) {
      const t0 = Date.now()
      this.setData({ list: next }, () => this.setData({ ms: Date.now() - t0 }))
    },

    // TODO-5: 在头部插入一条新数据
    //   注意：这里必须整体替换 list 才能触发重排。
    //   思考：为什么不能用 setData({ 'list[0]': item })？
    prepend() {
      // const id = nextId()
      // const item = { id, name: '新增 ' + id, checked: false }
      // this.measure([item, ...this.data.list])
    },

    // TODO-6: 逆序
    reverse() {},

    // TODO-7: 删除第 2 条
    removeSecond() {},

    reset() { this.measure(make(5)) },

    /** 性能对比用：把列表扩到 1000 条再做头部插入 */
    big() { this.measure(make(1000)) }
  }
})
