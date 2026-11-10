/**
 * wx API 的 Mock。
 *
 * TODO-5: 补全，至少覆盖项目里用到的所有 wx API。
 *
 * 原则：能用 jest.fn() 就用它 —— 这样可以断言"被调用了几次、参数是什么"。
 */
const storage = new Map()

module.exports = {
  // ── 存储 ──
  getStorageSync: key => storage.get(key),
  setStorageSync: (key, data) => storage.set(key, data),
  removeStorageSync: key => storage.delete(key),
  clearStorageSync: () => storage.clear(),
  getStorageInfoSync: () => ({ keys: [...storage.keys()], currentSize: 0, limitSize: 10240 }),

  setStorage: jest.fn(({ key, data, success, complete }) => {
    storage.set(key, data)
    success && success({ errMsg: 'setStorage:ok' })
    complete && complete()
  }),
  getStorage: jest.fn(({ key, success, fail, complete }) => {
    if (storage.has(key)) success && success({ data: storage.get(key) })
    else fail && fail({ errMsg: 'getStorage:fail data not found' })
    complete && complete()
  }),
  removeStorage: jest.fn(({ key, success }) => {
    storage.delete(key)
    success && success()
  }),

  // ── 网络 ──
  request: jest.fn(({ success }) => {
    success && success({ statusCode: 200, data: { code: 0, message: 'ok', data: {} }, header: {} })
    return { abort: jest.fn(), onHeadersReceived: jest.fn() }
  }),
  // TODO-5: uploadFile / downloadFile / connectSocket

  login: jest.fn(({ success }) => success && success({ code: 'MOCK_CODE' })),
  checkSession: jest.fn(({ success }) => success && success()),

  // ── 交互 ──
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(({ success }) => success && success({ confirm: true, cancel: false })),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),

  // ── 系统信息 ──
  getWindowInfo: () => ({ windowWidth: 375, windowHeight: 667, pixelRatio: 2, safeArea: {} }),
  getDeviceInfo: () => ({ brand: 'mock', model: 'MockPhone', system: 'iOS 17.0', platform: 'ios' }),
  getAppBaseInfo: () => ({ SDKVersion: '3.0.0', language: 'zh_CN', version: '8.0.0' }),
  canIUse: jest.fn(() => true),
  nextTick: fn => setTimeout(fn, 0),

  // ── TabBar ──
  setTabBarBadge: jest.fn(),
  removeTabBarBadge: jest.fn(),

  // ── 测试辅助 ──
  __reset: () => storage.clear(),
  __seedStorage: (key, value) => storage.set(key, value),
  __storage: storage
}
