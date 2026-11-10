/**
 * 生成基准测试用的数据。
 *
 *   lean —— 每项 3 个字段，只保留渲染必需的
 *   fat  —— 额外带 200 字符的 desc 和 20 个 tags（模拟"直接把接口响应塞进 data"）
 */
const LOREM = 'x'.repeat(200)

function mock(n, mode = 'lean') {
  const list = new Array(n)
  for (let i = 0; i < n; i++) {
    const base = {
      id: i,
      title: `商品-${i}`,
      priceInCent: 1000 + i
    }
    list[i] = mode === 'fat'
      ? Object.assign({}, base, {
          desc: LOREM,
          tags: Array.from({ length: 20 }, (_, k) => `tag-${k}`),
          createdAt: Date.now(),
          cover: `https://cdn.example.com/img/${i}.jpg`,
          stock: 100,
          category: { id: i % 10, name: `分类-${i % 10}` }
        })
      : base
  }
  return list
}

module.exports = { mock }
