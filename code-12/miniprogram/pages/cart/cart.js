const { cartStore } = require('../../stores/cart')

Component({
  data: { count: 0, totalText: '￥0.00', v: '' },

  methods: {
    onLoad(query) {
      cartStore.hydrate([
        { id: 1, title: '山大文创帆布包', priceInCent: 5900, qty: 2, checked: true, stock: 10 },
        { id: 2, title: '校徽金属书签', priceInCent: 1900, qty: 1, checked: true, stock: 3 }
      ])
      this.setData({
        v: query.v || '',
        count: cartStore.count,
        totalText: cartStore.totalText
      })
    }
  }
})
