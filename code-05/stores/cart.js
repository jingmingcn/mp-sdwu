/**
 * 购物车 Store
 *
 * 三条铁律：
 *   1. 金额全程用「整数分」，只在渲染前一刻转成「元」字符串
 *   2. action 是唯一写入口，校验写在 action 里
 *   3. 本文件不 import 任何 wx.* —— 这样才能在 Node 里直接单测
 */
const { observable, action } = require('mobx-miniprogram')

const clampQty = (qty, stock) =>
  Math.max(1, Math.min(stock || 99, Math.floor(Number(qty)) || 1))

const cartStore = observable({
  // ── 状态 ──
  items: [],   // [{ id, title, cover, priceInCent, qty, checked, stock }]

  // ── 派生（getter 即 computed，自动缓存） ──

  // TODO-1: 勾选项
  get checkedItems() {
    return []
  },

  // TODO-2: 总件数（所有项的 qty 之和，不论是否勾选）
  get count() {
    return 0
  },

  // TODO-3: 勾选项的总金额（分）
  get totalInCent() {
    return 0
  },

  // TODO-4: 展示用的总金额文本，如 '￥118.00'
  get totalText() {
    return '￥0.00'
  },

  // TODO-5: 是否全选（空购物车时为 false）
  get allChecked() {
    return false
  },

  /**
   * TODO-6: 渲染用的精简列表 —— 本实验的重点
   *
   * 只保留模板真正用到的字段 + 预格式化好的文本。
   * 直接把 items 绑到 fields 上，会把 stock、cover 原图 URL 等全传过渲染层。
   *
   * 建议形状：{ id, title, qty, checked, priceText, subtotalText }
   */
  get viewList() {
    return []
  },

  // ── 动作 ──

  // TODO-7: 加入购物车。已存在则数量 +1（不超过 stock），否则新增并默认勾选
  add: action(function (goods) {}),

  // TODO-8: 设置数量。范围 [1, stock]，小数向下取整，非法值取 1
  setQty: action(function (id, qty) {}),

  // TODO-9: 勾选/取消单项
  toggle: action(function (id) {}),

  // TODO-10: 全选/全不选
  toggleAll: action(function (checked) {}),

  // TODO-11: 删除单项
  remove: action(function (id) {}),

  // TODO-12: 清空已勾选项（结算后调用）
  clearChecked: action(function () {}),

  // TODO-13: 从持久化数据恢复（用于启动时）
  hydrate: action(function (items) {
    this.items = Array.isArray(items) ? items : []
  })
})

module.exports = { cartStore, clampQty }
