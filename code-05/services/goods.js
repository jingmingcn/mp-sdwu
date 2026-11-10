/** 商品数据（本实验用本地 mock，第六章起换成真实接口） */
const GOODS = [
  { id: 1, title: '山大文创帆布包', cover: '/images/g1.png', priceInCent: 5900, stock: 10 },
  { id: 2, title: '校徽金属书签', cover: '/images/g2.png', priceInCent: 1900, stock: 3 },
  { id: 3, title: '稷下学宫笔记本', cover: '/images/g3.png', priceInCent: 3300, stock: 99 },
  { id: 4, title: '百廿校庆纪念币', cover: '/images/g4.png', priceInCent: 12800, stock: 5 },
  { id: 5, title: '兴隆山限定马克杯', cover: '/images/g5.png', priceInCent: 4500, stock: 20 },
  { id: 6, title: '中心校区明信片套装', cover: '/images/g6.png', priceInCent: 999, stock: 50 }
]

function list() {
  return Promise.resolve(GOODS.map(g => Object.assign({}, g)))
}

module.exports = { list, GOODS }
