/**
 * UI 自动化测试。
 *
 * 前置：开发者工具 → 设置 → 安全设置 → 开启**服务端口**。
 *
 * 特点：慢、脆弱 —— 只覆盖核心链路，不进常规 CI。
 *   npm run test:e2e
 */
const automator = require('miniprogram-automator')
const path = require('path')

const CLI = process.env.WX_CLI ||
  (process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat'
    : '/Applications/wechatwebdevtools.app/Contents/MacOS/cli')

let mp

beforeAll(async () => {
  mp = await automator.launch({
    cliPath: CLI,
    projectPath: path.resolve(__dirname, '../../miniprogram')
  })
}, 60000)

afterAll(async () => {
  if (mp) await mp.close()
})

// TODO-16: 下单主流程
test('浏览 → 评分 → 进入购物车', async () => {
  const page = await mp.reLaunch('/pages/index/index')
  await page.waitFor(800)

  // 1. 点第 4 颗星
  const stars = await page.$$('.star')
  expect(stars.length).toBe(5)
  await stars[3].tap()
  await page.waitFor(200)

  // 2. 断言分值已更新
  const score = await (await page.$('.kv__v')).text()
  expect(score).toBe('4')

  // 3. 进入购物车
  // TODO-16: 补全 —— 点击「购物车」按钮，断言路径与件数
})

// TODO-17: 未登录访问需要登录的页面应跳登录页
test.skip('未登录访问「我的订单」应跳登录页', async () => {})

// TODO-18: 断网时列表展示缓存内容
test.skip('断网时列表展示缓存内容', async () => {})
