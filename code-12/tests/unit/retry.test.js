const { backoff, isRetryable } = require('../../miniprogram/request/retry')

describe('backoff 退避序列', () => {
  test.each([
    [0, 300],
    [1, 600],
    [2, 1200],
    [3, 2400],
    [4, 3000],
    [10, 3000]
  ])('backoff(%i) === %i（无抖动时）', (n, expected) => {
    expect(backoff(n)).toBe(expected)
  })

  test('抖动会叠加在退避时间之上', () => {
    expect(backoff(0, { jitter: 50 })).toBe(350)
  })

  test('maxDelay 生效', () => {
    expect(backoff(20, { base: 300, maxDelay: 1000 })).toBe(1000)
  })
})

describe('isRetryable', () => {
  test.each([
    [{ type: 'NETWORK' }, true],
    [{ type: 'TIMEOUT' }, true],
    [{ type: 'HTTP', statusCode: 500 }, true],
    [{ type: 'HTTP', statusCode: 503 }, true],
    [{ type: 'HTTP', statusCode: 404 }, false],
    [{ type: 'HTTP', statusCode: 401 }, false],
    [{ type: 'BIZ' }, false],
    [{ type: 'ABORT' }, false],
    [null, false]
  ])('isRetryable(%p) === %p', (err, expected) => {
    expect(isRetryable(err)).toBe(expected)
  })
})
