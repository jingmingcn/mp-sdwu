/**
 * 模拟一个"依赖 300KB 图表库"的重组件。
 * TODO-11: 它应该放在分包里，页面 json 用 componentPlaceholder 做占位，
 *          这样主包体积不受影响，首屏也不被它拖慢。
 */
Component({
  options: { virtualHost: true },
  data: { bars: [] },
  lifetimes: {
    attached() {
      this.setData({ bars: Array.from({ length: 12 }, () => 20 + Math.random() * 80) })
    }
  }
})
