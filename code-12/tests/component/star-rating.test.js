const simulate = require('miniprogram-simulate')
const path = require('path')

const id = simulate.load(
  path.resolve(__dirname, '../../miniprogram/components/star-rating/index'),
  'star-rating'
)

/**
 * ⚠ 关键坑：miniprogram-simulate 的 dispatchEvent 是**异步**的
 * （内部用 Promise.resolve().then 模拟真实的事件时序）。
 * 所以每次派发事件后必须 await simulate.sleep(0)，否则断言拿到的是旧状态。
 */
function render(props) {
  const comp = simulate.render(id, props)
  comp.attach(document.createElement('parent-wrapper'))
  return comp
}

const onCount = comp =>
  comp.querySelectorAll('.star').filter(n => n.dom.className.indexOf('is-on') >= 0).length

async function tap(comp, index) {
  comp.querySelectorAll('.star')[index].dispatchEvent('tap')
  await simulate.sleep(0)
}

describe('star-rating', () => {
  test('TODO-12: 点击第 3 颗星触发 change，detail.value === 3', async () => {
    const comp = render({ defaultValue: 0, max: 5 })
    const got = []
    comp.addEventListener('change', e => got.push(e.detail))

    const stars = comp.querySelectorAll('.star')
    expect(stars).toHaveLength(5)

    await tap(comp, 2)
    expect(got).toEqual([{ value: 3 }])
  })

  test('TODO-13: readonly 时不触发 change', async () => {
    const comp = render({ value: 2, readonly: true })
    const got = []
    comp.addEventListener('change', e => got.push(e.detail))

    await tap(comp, 4)
    expect(got).toEqual([])
  })

  test('TODO-14: 受控模式下父级不写回，界面不变', async () => {
    const comp = render({ value: 2, max: 5 })
    const got = []
    comp.addEventListener('change', e => got.push(e.detail))
    expect(onCount(comp)).toBe(2)

    await tap(comp, 4)

    // change 抛出去了，但父级没写回 value，点亮数必须保持 2
    expect(got).toEqual([{ value: 5 }])
    expect(onCount(comp)).toBe(2)
  })

  test('TODO-15: max 变化时星星数量跟随', () => {
    const comp = render({ defaultValue: 3, max: 5 })
    expect(comp.querySelectorAll('.star')).toHaveLength(5)

    comp.setData({ max: 10 })
    expect(comp.querySelectorAll('.star')).toHaveLength(10)
  })

  test('defaultValue 在首次渲染就生效（不需要点击）', () => {
    const comp = render({ defaultValue: 3, max: 5 })
    expect(onCount(comp)).toBe(3)
  })

  test('非受控：点击后自己更新', async () => {
    const comp = render({ defaultValue: 0, max: 5 })
    await tap(comp, 3)
    expect(onCount(comp)).toBe(4)
  })

  test('受控：父级把 value 从 5 改成 2，界面立即跟随', () => {
    const comp = render({ value: 5, max: 5 })
    expect(onCount(comp)).toBe(5)
    comp.setData({ value: 2 })
    expect(onCount(comp)).toBe(2)
  })
})
