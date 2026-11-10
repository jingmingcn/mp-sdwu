const { setItem, getItem, removeItem, purgeExpired, PREFIX } = require('../../miniprogram/utils/storage')

describe('storage TTL', () => {
  test('未过期时能读到', () => {
    setItem('k', { a: 1 }, 10000)
    expect(getItem('k')).toEqual({ a: 1 })
  })

  test('过期后返回默认值并删除', () => {
    setItem('k', 'v', 10)
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 100000)
    expect(getItem('k', 'fallback')).toBe('fallback')
    expect(wx.getStorageSync(PREFIX + 'k')).toBeUndefined()
    Date.now.mockRestore()
  })

  test('ttl 为 0 表示永不过期', () => {
    setItem('forever', 1)
    expect(getItem('forever')).toBe(1)
  })

  test('读不存在的 key 返回默认值', () => {
    expect(getItem('nope', 'dft')).toBe('dft')
  })

  test('前缀隔离：不会读到没有前缀的 key', () => {
    wx.setStorageSync('k', 'raw')
    expect(getItem('k', null)).toBeNull()
  })

  test('removeItem', () => {
    setItem('k', 1)
    removeItem('k')
    expect(getItem('k', null)).toBeNull()
  })
})

describe('purgeExpired', () => {
  test('只清理已过期的项', () => {
    setItem('a', 1, 10)
    setItem('b', 2, 100000)
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)
    expect(purgeExpired()).toBe(1)
    expect(getItem('b')).toBe(2)
    Date.now.mockRestore()
  })
})

describe('容量超限降级', () => {
  test('首次写入失败时清理过期项后重试', () => {
    setItem('old', 1, 10)
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000)

    let first = true
    const origin = wx.setStorageSync
    wx.setStorageSync = jest.fn((k, v) => {
      if (first) {
        first = false
        throw new Error('exceed storage max size')
      }
      return origin(k, v)
    })

    expect(setItem('new', 'v')).toBe(true)

    wx.setStorageSync = origin
    Date.now.mockRestore()
  })
})
