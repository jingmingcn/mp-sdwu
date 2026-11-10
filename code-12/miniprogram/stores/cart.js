/**
 * 购物车 Store（实验五的成品，本实验用来练测试）。
 *
 * ⚠ 本文件不 import 任何 wx.* —— 这就是能在 Node 里直接单测的前提。
 */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const cartStore = {
  items: [],

  get count() {
    return this.items.reduce((s, it) => s + it.qty, 0)
  },
  get checkedItems() {
    return this.items.filter(it => it.checked)
  },
  get totalInCent() {
    return this.checkedItems.reduce((s, it) => s + it.priceInCent * it.qty, 0)
  },
  get totalText() {
    return '￥' + (this.totalInCent / 100).toFixed(2)
  },

  hydrate(items) {
    this.items = Array.isArray(items) ? items.slice() : []
  },

  add(goods) {
    const hit = this.items.find(it => it.id === goods.id)
    if (hit) hit.qty = clamp(hit.qty + 1, 1, hit.stock || 99)
    else this.items.push(Object.assign({}, goods, { qty: 1, checked: true }))
  },

  setQty(id, qty) {
    const hit = this.items.find(it => it.id === id)
    if (!hit) return
    hit.qty = clamp(Math.floor(Number(qty)) || 1, 1, hit.stock || 99)
  },

  remove(id) {
    this.items = this.items.filter(it => it.id !== id)
  }
}

module.exports = { cartStore, clamp }
