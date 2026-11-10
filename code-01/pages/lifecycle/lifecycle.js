const { log } = require('../../utils/logger')

/**
 * 用 Component 构造器写页面 —— 页面生命周期放进 methods。
 * 好处：可以用 behaviors 与 observers；代价：钩子位置容易写错。
 */
Component({
  data: { tick: 0 },

  methods: {
    onLoad(query) {
      log('Page', 'onLoad', JSON.stringify(query))

      // TODO-4: 在 onLoad 里查询 .box 的尺寸，观察结果
      // 问题 1：这里的结果是什么？为什么？
      this.createSelectorQuery().select('.box').boundingClientRect(rect => {
        log('Page', 'onLoad 查询节点 =', JSON.stringify(rect))
      }).exec()

      // 计时器：用于验证清理逻辑
      this._timer = setInterval(() => {
        this._tick = (this._tick || 0) + 1
        log('Timer', 'tick', this._tick)
        this.setData({ tick: this._tick })
      }, 1000)
    },

    onShow() { log('Page', 'onShow') },

    onReady() {
      log('Page', 'onReady')

      // TODO-5: 同样的查询放在 onReady，对比结果
      this.createSelectorQuery().select('.box').boundingClientRect(rect => {
        log('Page', 'onReady 查询节点 =', JSON.stringify(rect))
      }).exec()
    },

    onHide() { log('Page', 'onHide') },

    onUnload() {
      log('Page', 'onUnload')

      // TODO-6: 先注释掉下面这行，观察离开页面后控制台的变化；
      //         记录错误信息原文后再恢复。
      clearInterval(this._timer)
    },

    goNext() { wx.navigateTo({ url: '/pages/bench/bench' }) },
    back() { wx.navigateBack() }
  }
})
