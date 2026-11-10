const { cartStore } = require('../cart')

const G = (id, price = 1000, stock = 10) => ({
  id,
  title: 'G' + id,
  cover: `https://cdn.example.com/${id}.jpg`,
  priceInCent: price,
  stock
})

beforeEach(() => { cartStore.hydrate([]) })

describe('add', () => {
  test('TODO-21: 新商品加入后数量为 1 且默认勾选', () => {
    // cartStore.add(G(1))
    // expect(cartStore.items).toHaveLength(1)
    // expect(cartStore.items[0].qty).toBe(1)
    // expect(cartStore.items[0].checked).toBe(true)
  })

  test('TODO-22: 重复加入同一商品数量累加', () => {})

  test('TODO-23: 数量不超过 stock', () => {})
})

describe('setQty', () => {
  test('TODO-24: 数量下限为 1', () => {})
  test('TODO-25: 数量上限为 stock', () => {})
  test('TODO-26: 传入小数向下取整', () => {})
  test('TODO-27: 对不存在的 id 无副作用', () => {})
})

describe('toggle / toggleAll / remove / clearChecked', () => {
  test('toggle 翻转单项勾选状态', () => {})
  test('toggleAll(false) 后 allChecked 为 false', () => {})
  test('remove 删除指定项', () => {})
  test('clearChecked 只清空勾选项', () => {})
})

describe('computed', () => {
  test('TODO-28: totalInCent 只统计勾选项', () => {})
  test('TODO-29: totalText 格式为 ￥xx.xx', () => {})
  test('TODO-30: 空购物车时 allChecked 为 false', () => {})
  test('TODO-31: viewList 不包含 stock / cover 字段', () => {
    // cartStore.add(G(1))
    // expect(cartStore.viewList[0]).not.toHaveProperty('stock')
    // expect(cartStore.viewList[0]).not.toHaveProperty('cover')
  })
})

describe('金额精度', () => {
  test('TODO-32: 3 件 33 分应为 99 分（不出现 0.1+0.2 类问题）', () => {
    // cartStore.add(G(1, 33))
    // cartStore.setQty(1, 3)
    // expect(cartStore.totalInCent).toBe(99)
    // expect(cartStore.totalText).toBe('￥0.99')
  })
})
