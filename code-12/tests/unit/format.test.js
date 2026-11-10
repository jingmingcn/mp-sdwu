const { formatPrice, ellipsis, parseDate, formatTime, get } = require('../../miniprogram/utils/format')

/**
 * 表驱动测试：边界值一目了然，新增用例只加一行。
 * 比写 5 个独立的 test 好维护得多。
 */
describe('formatPrice', () => {
  test.each([
    [0, '￥0.00'],
    [1, '￥0.01'],
    [12345, '￥123.45'],
    [null, '--'],
    [undefined, '--'],
    ['abc', '--']
  ])('formatPrice(%p) === %p', (input, expected) => {
    expect(formatPrice(input)).toBe(expected)
  })
})

describe('ellipsis', () => {
  test('不超长时原样返回', () => expect(ellipsis('abc', 5)).toBe('abc'))
  test('恰好等长时不截断', () => expect(ellipsis('abcde', 5)).toBe('abcde'))
  test('超长时截断加省略号', () => expect(ellipsis('abcdefg', 5)).toBe('abcde…'))
  test('空值安全', () => {
    expect(ellipsis(null, 5)).toBe('')
    expect(ellipsis(undefined, 5)).toBe('')
    expect(ellipsis('', 5)).toBe('')
  })
})

describe('parseDate 跨端安全', () => {
  test('横杠格式在任何引擎下都可解析', () => {
    const d = parseDate('2026-01-01 10:00:00')
    expect(Number.isNaN(d.getTime())).toBe(false)
    expect(d.getFullYear()).toBe(2026)
  })
  test('时间戳', () => expect(parseDate(0).getTime()).toBe(0))
  test('Date 原样返回', () => {
    const d = new Date()
    expect(parseDate(d)).toBe(d)
  })
  test('非法输入返回 Invalid Date', () => {
    expect(Number.isNaN(parseDate({}).getTime())).toBe(true)
  })
})

describe('formatTime', () => {
  test('补零', () => expect(formatTime('2026-01-05 09:07:00')).toBe('01-05 09:07'))
  test('非法输入', () => expect(formatTime('not a date')).toBe('--'))
})

describe('get', () => {
  test.each([
    [{ a: { b: { c: 1 } } }, 'a.b.c', undefined, 1],
    [{ a: { b: {} } }, 'a.b.c', 'def', 'def'],
    [null, 'a.b', 'def', 'def'],
    [{ a: 0 }, 'a', 'def', 0]
  ])('get(%p, %p) === %p', (obj, path, dft, expected) => {
    expect(get(obj, path, dft)).toBe(expected)
  })
})
