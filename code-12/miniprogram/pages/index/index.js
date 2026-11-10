const { setTrace, rlog } = require('../../utils/logger')
const { isOn } = require('../../services/feature')

Component({
  data: { score: 3 },

  methods: {
    onLoad() {
      // TODO-27: 在关键链路上打 trace，后台可用 home 精确检索
      setTrace('home')
      rlog('进入首页', { newCheckout: isOn('newCheckout') })
    },

    onRate(e) {
      this.setData({ score: e.detail.value })
    },

    goCart() {
      // 功能开关决定走哪个版本 —— 出问题时几秒内可关掉
      const url = isOn('newCheckout') ? '/pages/cart/cart?v=2' : '/pages/cart/cart'
      wx.navigateTo({ url })
    },

    throwError() {
      throw new Error('这是一个用于验证上报链路的测试错误')
    },

    rejectPromise() {
      Promise.reject(new Error('未被 catch 的 Promise'))
    }
  }
})
