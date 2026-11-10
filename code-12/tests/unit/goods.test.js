const { list, detail, BASE } = require('../../miniprogram/services/goods')

/** service 依赖 wx.request，所以要断言「调用参数」而不只是返回值 */
describe('goods service', () => {
  test('list 拼出正确的 url 与参数', async () => {
    wx.request.mockImplementationOnce(({ success }) =>
      success({ statusCode: 200, data: { code: 0, data: { items: [] } } })
    )
    await list(2, 30)

    const cfg = wx.request.mock.calls[0][0]
    expect(cfg.url).toBe(`${BASE}/goods`)
    expect(cfg.method).toBe('GET')
    expect(cfg.data).toEqual({ page: 2, size: 30 })
  })

  test('业务错误码被转成 rejection', async () => {
    wx.request.mockImplementationOnce(({ success }) =>
      success({ statusCode: 200, data: { code: 40001, message: '库存不足' } })
    )
    await expect(list()).rejects.toThrow('库存不足')
  })

  test('HTTP 错误被转成 rejection', async () => {
    wx.request.mockImplementationOnce(({ success }) =>
      success({ statusCode: 500, data: {} })
    )
    await expect(list()).rejects.toThrow('HTTP 500')
  })

  test('网络失败被转成 rejection', async () => {
    wx.request.mockImplementationOnce(({ fail }) => fail({ errMsg: 'request:fail timeout' }))
    await expect(list()).rejects.toThrow('timeout')
  })

  test('detail 缺少 id 时直接 reject，不发请求', async () => {
    await expect(detail()).rejects.toThrow('缺少 id')
    expect(wx.request).not.toHaveBeenCalled()
  })
})
