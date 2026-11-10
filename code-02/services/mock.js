/** 生成商品列表。lean 只保留渲染字段，fat 带冗余字段。 */
function mock(n, mode = 'lean') {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => {
    const base = {
      id: i,
      title: `山东大学文创商品第 ${i} 号 · 帆布包`,
      priceInCent: 1000 + i * 7,
      createdAt: now - i * 3600 * 1000,
      stock: i % 17
    }
    if (mode === 'fat') {
      return Object.assign({}, base, {
        // 方案 A（逻辑层预处理）会额外传这三个派生字段
        priceText: '￥' + ((1000 + i * 7) / 100).toFixed(2),
        titleShort: `山东大学文创商品第 ${i}…`,
        timeText: '--',
        desc: 'x'.repeat(200),
        tags: Array.from({ length: 20 }, (_, k) => 'tag-' + k)
      })
    }
    return base
  })
}

module.exports = { mock }
