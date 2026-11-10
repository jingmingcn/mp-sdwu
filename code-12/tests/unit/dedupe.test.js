const { dedupe, keyOf, inflight } = require('../../miniprogram/request/dedupe')

beforeEach(() => inflight.clear())

describe('keyOf', () => {
  test('相同请求产生相同 key', () => {
    const a = { method: 'GET', url: '/a', data: { p: 1 } }
    const b = { method: 'GET', url: '/a', data: { p: 1 } }
    expect(keyOf(a)).toBe(keyOf(b))
  })
  test('参数不同则 key 不同', () => {
    expect(keyOf({ method: 'GET', url: '/a', data: { p: 1 } }))
      .not.toBe(keyOf({ method: 'GET', url: '/a', data: { p: 2 } }))
  })
})

describe('dedupe', () => {
  test('同 key 的在途 GET 复用同一个 Promise', async () => {
    const exec = jest.fn(() => new Promise(r => setTimeout(() => r('data'), 20)))
    const cfg = { method: 'GET', url: '/a', data: {} }

    const [a, b, c] = await Promise.all([
      dedupe(cfg, exec),
      dedupe(cfg, exec),
      dedupe(cfg, exec)
    ])

    expect(exec).toHaveBeenCalledTimes(1)
    expect(a).toBe('data')
    expect(b).toBe('data')
    expect(c).toBe('data')
  })

  test('完成后清理，下一次会真正发出', async () => {
    const exec = jest.fn(() => Promise.resolve(1))
    const cfg = { method: 'GET', url: '/a', data: {} }
    await dedupe(cfg, exec)
    await dedupe(cfg, exec)
    expect(exec).toHaveBeenCalledTimes(2)
    expect(inflight.size).toBe(0)
  })

  test('POST 不去重', async () => {
    const exec = jest.fn(() => Promise.resolve(1))
    const cfg = { method: 'POST', url: '/a', data: {} }
    await Promise.all([dedupe(cfg, exec), dedupe(cfg, exec)])
    expect(exec).toHaveBeenCalledTimes(2)
  })

  test('dedupe: false 时跳过', async () => {
    const exec = jest.fn(() => Promise.resolve(1))
    const cfg = { method: 'GET', url: '/a', dedupe: false }
    await Promise.all([dedupe(cfg, exec), dedupe(cfg, exec)])
    expect(exec).toHaveBeenCalledTimes(2)
  })

  test('失败时也要清理', async () => {
    const exec = jest.fn(() => Promise.reject(new Error('boom')))
    const cfg = { method: 'GET', url: '/a', data: {} }
    await expect(dedupe(cfg, exec)).rejects.toThrow('boom')
    expect(inflight.size).toBe(0)
  })
})
