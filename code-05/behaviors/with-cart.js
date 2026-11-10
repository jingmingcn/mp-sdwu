/**
 * 让任意页面/组件都能读到购物车件数与总价。
 * 用 BehaviorWithStore 把绑定逻辑抽出来，避免每个页面重复写 storeBindings。
 */
const { BehaviorWithStore } = require('mobx-miniprogram-bindings')
const { cartStore } = require('../stores/cart')

module.exports = BehaviorWithStore({
  storeBindings: {
    store: cartStore,
    fields: ['count', 'totalText'],
    actions: ['add']
  }
})
