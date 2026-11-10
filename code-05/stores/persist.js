/**
 * 把 store 的指定字段持久化到 Storage。
 *
 * 三个陷阱：
 *   ① autorun 里必须「访问」到字段才会被追踪
 *   ② observable 是代理对象，不能直接 setStorage —— 要转成纯对象
 *   ③ 连续改数量会疯狂写盘 —— 必须去抖
 */
const { autorun } = require('mobx-miniprogram')

function toPlain(v) {
  return JSON.parse(JSON.stringify(v))
}

function persist(store, key, fields, options) {
  const { debounce = 300 } = options || {}

  // TODO-17: 启动时恢复
  //   注意：恢复要走 action（hydrate），不能直接赋值
  //   const saved = wx.getStorageSync(key)

  // TODO-18: 变化时保存
  let timer = null
  return autorun(() => {
    const snapshot = {}
    // 必须显式访问每个字段，否则 MobX 追踪不到
    fields.forEach(f => { snapshot[f] = toPlain(store[f]) })

    clearTimeout(timer)
    timer = setTimeout(() => {
      wx.setStorage({ key, data: snapshot, fail: e => console.error('[persist]', e) })
    }, debounce)
  })
}

module.exports = { persist, toPlain }
