/** setupFilesAfterEnv —— 测试框架已就绪，可以用 beforeEach 等钩子 */
beforeEach(() => {
  global.wx.__reset()
  jest.clearAllMocks()
})
