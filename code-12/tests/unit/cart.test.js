const { cartStore } = require('../../miniprogram/stores/cart')

const G = (id, price = 1000, stock = 10) => ({ id, title: 'G' + id, priceInCent: price, stock })

beforeEach(() => cartStore.hydrate([]))

describe('add', () => {
  test('新商品加入后数量为 1 且默认勾选', () => {
    cartStore.add(G(1))
    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].qty).toBe(1)
    expect(cartStore.items[0].checked).toBe(true)
  })

  test('重复加入同一商品数量累加', () => {
    cartStore.add(G(1))
    cartStore.add(G(1))
    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.count).toBe(2)
  })

  test('数量不超过 stock', () => {
    const g = G(1, 1000, 2)
    cartStore.add(g)
    cartStore.add(g)
    cartStore.add(g)
    expect(cartStore.items[0].qty).toBe(2)
  })
})

describe('setQty', () => {
  beforeEach(() => cartStore.add(G(1, 1000, 5)))

  test.each([
    [0, 1],
    [-3, 1],
    [3, 3],
    [99, 5],
    [2.9, 2]
  ])('setQty(1, %p) → qty === %p', (input, expected) => {
    cartStore.setQty(1, input)
    expect(cartStore.items[0].qty).toBe(expected)
  })

  test('对不存在的 id 无副作用', () => {
    cartStore.setQty(999, 3)
    expect(cartStore.items[0].qty).toBe(1)
  })
})

describe('computed', () => {
  test('totalInCent 只统计勾选项', () => {
    cartStore.add(G(1, 1000))
    cartStore.add(G(2, 2000))
    cartStore.items[1].checked = false
    expect(cartStore.totalInCent).toBe(1000)
    expect(cartStore.totalText).toBe('￥10.00')
  })

  test('金额精度：3 件 33 分应为 99 分', () => {
    cartStore.add(G(1, 33))
    cartStore.setQty(1, 3)
    expect(cartStore.totalInCent).toBe(99)
    expect(cartStore.totalText).toBe('￥0.99')
  })
})

describe('remove', () => {
  test('删除指定项', () => {
    cartStore.add(G(1))
    cartStore.add(G(2))
    cartStore.remove(1)
    expect(cartStore.items.map(i => i.id)).toEqual([2])
  })
})
