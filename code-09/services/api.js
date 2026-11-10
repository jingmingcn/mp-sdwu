const { BASE_URL } = require('../config')

/** 本实验的数据源：本地生成，避免依赖外部服务 */
function feed(page = 1, size = 20, total = 2000) {
  const start = (page - 1) * size
  const n = Math.min(size, total - start)
  if (n <= 0) return Promise.resolve({ items: [], total })

  const items = Array.from({ length: n }, (_, i) => {
    const id = start + i
    return {
      id,
      title: `山东大学文创商品第 ${id} 号 · 帆布包 · 限量发售`,
      priceInCent: 1000 + id * 7,
      cover: `https://cdn.example.com/goods/${id % 12}.jpg`,
      // ↓ 冗余字段：渲染完全用不到，但基线版本全部传给了渲染层
      desc: 'x'.repeat(200),
      tags: Array.from({ length: 20 }, (_, k) => `tag-${k}`),
      seller: { id: id % 50, name: '商家 ' + (id % 50), license: 'L' + id },
      stock: id % 30,
      createdAt: Date.now() - id * 3600_000,
      updatedAt: '2026-08-01'
    }
  })

  // 模拟网络延迟
  return new Promise(r => setTimeout(() => r({ items, total }), 300))
}

function detail(id) {
  return new Promise(r => setTimeout(() => r({
    id, title: `商品 ${id} 详情`, priceInCent: 1000 + id * 7,
    cover: `https://cdn.example.com/goods/${id % 12}.jpg`,
    content: '这里是很长的商品详情…'
  }), 600))
}

const config = () => new Promise(r => setTimeout(() => r({ theme: 'default' }), 250))
const checkUpdate = () => new Promise(r => setTimeout(r, 300))
const initTracker = () => new Promise(r => setTimeout(r, 200))
const login = () => new Promise(r => setTimeout(() => r({ token: 't_mock' }), 400))

module.exports = { feed, detail, config, checkUpdate, initTracker, login, BASE_URL }
