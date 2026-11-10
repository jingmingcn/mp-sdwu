const { reaction } = require('mobx-miniprogram')
const { cartStore } = require('./stores/cart')
const { persist } = require('./stores/persist')

App({
  onLaunch() {
    // 持久化：启动时恢复，变化时去抖写盘
    persist(cartStore, 'cart:items', ['items'])

    /**
     * TODO-20: TabBar 角标
     *
     * 用 reaction 而不是 autorun —— reaction 只在指定表达式（count）变化时才跑，
     * autorun 会把回调里访问到的所有 observable 都变成依赖。
     */
    reaction(
      () => cartStore.count,
      count => {
        if (count > 0) {
          wx.setTabBarBadge({ index: 1, text: count > 99 ? '99+' : String(count) })
        } else {
          wx.removeTabBarBadge({ index: 1 })
        }
      },
      { fireImmediately: true }
    )
  }
})
