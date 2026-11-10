---
marp: true
size: 16:9
theme: am_blue
paginate: true
math: katex
footer: \ *张丽，井明（数据科学与计算机学院）* *移动端小程序开发（miniprogram）* *2026年秋*
---

<!-- _class: cover_e -->
<!-- _paginate: "" -->
<!-- _footer: ![](./images/logo_transparent.png) -->
<!-- _header: ![](./images/logo-1_transparent.png) -->

# 实验十二 测试、CI 与发布运维

###### “慎终如始，则无败事。”

张丽，井明
数据科学与计算机学院
jingming@sdu.edu.cn
2026年秋

---

<!-- _header: 目录<br>CONTENTS<br>![](images/logo-1_transparent.png)-->
<!-- _class: toc_b -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

- 实验目标与准备
- 任务一：质量工具链
- 任务二：三层测试
- 任务三：miniprogram-ci 与 CI/CD
- 任务四：监控与功能开关
- 期末项目要求

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

给一个**已有的完整工程**（前 11 个实验的综合体）补齐工程化能力：

1. ESLint + Prettier + Husky，把规范变成流程；
2. Jest 单测 + `miniprogram-simulate` 组件测试 + `miniprogram-automator` UI 测试；
3. `miniprogram-ci` 自动化上传 + GitHub Actions 流水线 + **体积红线**；
4. 错误上报、实时日志、**功能开关**与灰度发布方案。

<br>

> 对应 **第十二章**。配套代码：`code-12/`

---

## 1.2 准备

```bash
cd code-12
npm install
```

<!-- _class: smalltext -->

```text
code-12/
├── miniprogram/         # 小程序源码（含 utils / stores / services / components）
├── tests/
│   ├── setup.js
│   ├── mocks/wx.js
│   └── e2e/
├── scripts/
│   ├── upload.js
│   ├── check-size.js
│   └── lint-setdata.js
├── .github/workflows/ci.yml
├── jest.config.js  .eslintrc.js  .prettierrc
└── package.json
```

**上传密钥**：MP 后台 → 开发管理 → 开发设置 → 小程序代码上传密钥。
**下载后放到项目外**，用环境变量指向它。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：质量工具链

---

## 2.1 ESLint

<!-- _class: smalltext -->

```js
// TODO-1: 补全 .eslintrc.js
module.exports = {
  env: { es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  globals: {
    // TODO: 声明小程序全局变量，否则全是 no-undef 报错
  },
  extends: ['eslint:recommended'],
  rules: {
    // TODO: 至少配置 5 条对本项目有意义的规则，并在报告里说明理由
  },
  overrides: [
    { files: ['tests/**/*.js'], env: { jest: true } },
    { files: ['scripts/**/*.js', 'server/**/*.js'], env: { node: true } }
  ]
}
```

<br>

**跑一遍**：`npx eslint miniprogram --ext .js`
记录报错数量，**逐条修复**（不许用 `eslint-disable` 糊弄，除非有正当理由并写注释）。

---

## 2.2 自定义检查脚本

<!-- _class: smalltext -->

```js
// scripts/lint-setdata.js
// TODO-2: 实现至少 5 条项目特定的检查
const RULES = [
  { re: /setData\([^)]*new Date\(/,          msg: 'setData 不能传 Date 对象' },
  { re: /created\s*\([\s\S]*?setData/,        msg: 'created 中不能 setData' },
  // TODO: 再加 3 条，例如：
  //   - 组件里直接 setData 修改 properties
  //   - 循环体内调用 setData
  //   - wx.getStorageSync 出现在 app.js 顶层
]
```

<br>

**要求**：

1. 每条规则要有**能触发它的样例代码**（放 `tests/fixtures/`）；
2. 脚本要能报出**文件名 + 行号**；
3. 接进 `npm run lint`。

**思考**：正则匹配会有**误报**。你的规则误报率如何？如何降低？

---

## 2.3 Husky + lint-staged

```bash
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,wxss,wxml}": ["prettier --write"]
  }
}
```

```bash
# TODO-3: .husky/pre-commit
npx lint-staged
node scripts/lint-setdata.js

# TODO-4: .husky/pre-push
npm test
```

<br>

**验证**：故意提交一段有 lint 错误的代码，
截图证明**提交被拦下**。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：三层测试

---

## 3.1 wx 的 Mock

<!-- _class: smalltext -->

```js
// tests/mocks/wx.js
// TODO-5: 补全 Mock，至少覆盖项目里用到的所有 wx API
const storage = new Map()

module.exports = {
  // 存储
  getStorageSync: k => storage.get(k),
  setStorageSync: (k, v) => storage.set(k, v),
  // TODO: setStorage / getStorage / removeStorage / getStorageInfoSync

  // 网络（用 jest.fn 便于断言）
  request: jest.fn(),
  // TODO: uploadFile / downloadFile

  // 交互
  showToast: jest.fn(), showModal: jest.fn(), showLoading: jest.fn(), hideLoading: jest.fn(),

  // 系统信息
  getWindowInfo: () => ({ windowWidth: 375, windowHeight: 667, pixelRatio: 2 }),
  // TODO: getDeviceInfo / getAppBaseInfo / canIUse

  // 测试辅助
  __reset: () => { storage.clear() },
  __setStorage: (k, v) => storage.set(k, v)
}
```

---

## 3.2 单元测试（目标 70%）

<!-- _class: smalltext -->

**必须覆盖的模块**：

| 模块 | 测试重点 |
|---|---|
| `utils/format.js` | 边界值、空值、异常输入（用 `test.each` 表驱动） |
| `utils/storage.js` | TTL 过期、容量超限降级、前缀隔离 |
| `stores/cart.js` | 数量边界、computed 正确性、金额精度 |
| `request/retry.js` | 退避时间序列、可重试判定 |
| `request/dedupe.js` | 同 key 复用、完成后清理 |
| `services/*.js` | 用 mock 的 request 断言调用参数 |

```js
// TODO-6 ~ TODO-11: 为上述六个模块各写一组测试
```

<br>

**要求**：`collectCoverageFrom` 覆盖 `utils` / `stores` / `services` / `request`，
**行覆盖率 ≥ 80%，分支覆盖率 ≥ 70%**。

---

## 3.3 组件测试（目标 20%）

<!-- _class: smalltext -->

```bash
npm i -D miniprogram-simulate
```

```js
// TODO-12: 为 star-rating 写组件测试
const simulate = require('miniprogram-simulate')
const id = simulate.load('/components/star-rating/index', 'star-rating')

test('点击第 3 颗星触发 change', () => {
  const comp = simulate.render(id, { defaultValue: 0, max: 5 })
  comp.attach(document.createElement('parent-wrapper'))
  const handler = jest.fn()
  comp.instance.triggerEvent = handler
  comp.querySelectorAll('.star')[2].dispatchEvent('tap')
  expect(handler).toHaveBeenCalledWith('change', { value: 3 })
})

// TODO-13: readonly 时不触发
// TODO-14: 受控模式下点击不改变内部状态
// TODO-15: max 变化时星星数量跟随
```

---

## 3.4 UI 自动化测试（目标 10%）

<!-- _class: tinytext -->

```bash
npm i -D miniprogram-automator
```

开发者工具 → 设置 → 安全设置 → 开启**服务端口**。

```js
// tests/e2e/checkout.test.js
const automator = require('miniprogram-automator')
jest.setTimeout(120000)

let mp
beforeAll(async () => {
  mp = await automator.launch({
    cliPath: process.env.WX_CLI || '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    projectPath: require('path').resolve(__dirname, '../../miniprogram')
  })
})
afterAll(async () => mp && mp.close())

// TODO-16: 下单主流程
test('浏览 → 加购 → 结算', async () => {
  let page = await mp.reLaunch('/pages/index/index')
  await page.waitFor(800)
  // 1. 点第一个商品卡片
  // 2. 断言进入详情页
  // 3. 点「加入购物车」
  // 4. switchTab 到购物车
  // 5. 断言件数为 1、总价正确
  // 6. 点结算，断言进入确认页
})

// TODO-17: 未登录访问「我的订单」应跳登录页
// TODO-18: 断网时列表展示缓存内容
```

---

## 3.5 测试策略反思

<!-- _class: smalltext -->

完成后回答：

1. 三层测试各花了多少时间写？各发现了多少个真实 Bug？
   **单位时间的 Bug 发现率**哪层最高？
2. UI 自动化测试跑一次要多久？它**失败过几次是因为测试本身不稳定**
   （而不是代码真有问题）？
3. 如果只能保留一层测试，你会保留哪层？为什么？
4. `utils` 和 `stores` 能在 Node 里直接测，
   而 `services` 需要 mock `wx`。这个差异说明了什么？
   如果 `stores` 里直接调了 `wx.request` 会怎样？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：CI/CD

---

## 4.1 上传脚本

<!-- _class: smalltext -->

```js
// scripts/upload.js
const ci = require('miniprogram-ci')

// TODO-19: 实现上传
// 1. 从 git 取当前 branch 与 short hash，拼进 desc
// 2. version 取自 package.json
// 3. 先 ci.packNpm() 再 ci.upload()
// 4. ignores 要排除 tests / scripts / node_modules
// 5. robot 从环境变量读，默认 1
// 6. 打印各分包大小
```

```js
// TODO-20: 体积红线
// 主包 > 1.8MB 或总包 > 18MB 时抛错，让 CI 失败
function assertSize(subPackageInfo) { }
```

<br>

**注意**：`private.*.key` **绝不能提交**。
CI 里用 secrets 注入，用完 `rm -f`。

---

## 4.2 GitHub Actions

<!-- _class: smalltext -->

```yaml
# TODO-21: 补全 .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main, develop] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      # TODO: checkout / setup-node / npm ci / lint / test --coverage
      # TODO: 上传 coverage 产物
      # TODO: 覆盖率不达标要让 job 失败（jest 的 coverageThreshold 会自动做）

  upload:
    needs: quality
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      # TODO: 写入密钥 → node scripts/upload.js → 无论成败都删除密钥
```

<br>

**若无法使用 GitHub**：用本地脚本模拟整条流水线
（`npm run ci:local`），效果等价，报告里说明即可。

---

## 4.3 CI 踩坑记录

<!-- _class: smalltext -->

**TODO-22**：至少复现并解决下列三个问题，记录过程

| 问题 | 复现方法 | 解决 |
|---|---|---|
| `invalid ip` | 从未加白名单的机器上传 | |
| robot 冲突 | 两条流水线同时用 robot 1 | |
| 覆盖率不达标导致 CI 失败 | 删掉一组测试 | |

<br>

**必答**：GitHub Actions 的出口 IP 不固定，
而微信要求 IP 白名单。你有哪几种解法？各自的成本是什么？

---

## 4.4 发布流程演练

<!-- _class: smalltext -->

**TODO-23**：写出你的项目的**完整发布 SOP**（标准作业程序）

```markdown
## 发布 SOP

### T-1 天
- [ ] 冻结 develop 分支
- [ ] 跑全量测试 + UI 自动化
- [ ] ...

### 发布当天
- [ ] 从 develop 切 release/x.y.z
- [ ] CI 上传体验版（robot 3）
- [ ] 测试回归（附回归清单）
- [ ] 提交审核
- [ ] ...

### 审核通过后
- [ ] 分阶段发布 1% → 观察 2 小时
- [ ] 观察指标：JS 错误率 / 支付成功率 / ...
- [ ] ...

### 回滚预案
- [ ] 触发条件：...
- [ ] 操作步骤：...
- [ ] 通知范围：...
```

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：监控与功能开关

---

## 5.1 错误上报

<!-- _class: smalltext -->

```js
// utils/report.js
// TODO-24: 实现批量上报
// 1. 攒 3 秒或满 20 条就发一次
// 2. 每条自动带上：版本、页面路径、基础库版本、机型、网络类型
// 3. 上报失败时回填队列，但要限量（最多留 50 条，防止雪球）
// 4. 上报接口本身出错不能再触发上报（防止死循环）
export function report(type, data) { }
```

```js
// app.js
// TODO-25: 挂上三个全局钩子
App({
  onError(stack) { },
  onUnhandledRejection({ reason }) { },
  onPageNotFound(res) { }
})
```

<br>

**验证**：故意在页面里抛一个错，
确认上报里包含**完整堆栈**与**页面路径**。

---

## 5.2 实时日志

<!-- _class: smalltext -->

```js
// utils/logger.js
// TODO-26: 封装 RealtimeLogManager
const rt = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null

export function setTrace(key) { rt && rt.setFilterMsg(key) }
export function addTrace(key) { rt && rt.addFilterMsg(key) }
export function rlog(...a) { rt && rt.info(...a) }
export function rerror(...a) { rt && rt.error(...a) }
```

```js
// 在关键链路上打 trace
// TODO-27: 订单详情页用 order:<id> 作为 filterMsg
onLoad({ id }) {
  setTrace(`order:${id}`)
  rlog('进入订单详情', { id, version: VERSION })
}
```

<br>

**验证**：真机操作一遍，
然后在 MP 后台"实时日志"里用 `order:123` 检索，**截图**。

---

## 5.3 性能上报

<!-- _class: smalltext -->

```js
// TODO-28: 采集 Performance 数据
const perf = wx.getPerformance()
perf.createObserver(list => {
  list.getEntries().forEach(e => {
    report('perf', {
      entryType: e.entryType,      // navigation / render / script / loadPackage
      name: e.name,
      duration: e.duration,
      path: e.path
    })
  })
}).observe({ entryTypes: ['navigation', 'render', 'script', 'loadPackage'] })
```

<br>

**TODO-29**：把采集到的数据做成一张表

| entryType | name | 中位数 | P90 |
|---|---|---|---|
| loadPackage | __APP__ | | |
| navigation | firstRender | | |
| script | evaluateScript | | |
| render | firstPaint | | |

**必答**：这些数据与你在实验九里用 `Date.now()` 测的值差多少？为什么？

---

## 5.4 功能开关

<!-- _class: smalltext -->

```js
// services/feature.js
// TODO-30: 实现开关系统
let flags = {}

export async function initFlags() {
  // 1. 用 SWR：先用本地缓存，后台刷新
  // 2. 接口失败时用「上次成功的值」，再失败用代码里的默认值
  // 3. 支持按用户分流（如 uid % 100 < 10 表示 10% 灰度）
}

export function isOn(key, fallback = false) { }
export function variant(key, fallback = 'A') { }   // A/B 分流
```

```js
// 使用
if (isOn('newCheckout')) {
  wx.navigateTo({ url: '/packageOrder/checkout-v2/index' })
} else {
  wx.navigateTo({ url: '/packageOrder/checkout/index' })
}
```

---

## 5.5 开关的降级演练

<!-- _class: smalltext -->

**TODO-31**：演练下列三个场景并记录表现

| 场景 | 期望行为 |
|---|---|
| 开关接口正常 | 用远程配置 |
| 开关接口超时 | 用本地缓存的上次配置 |
| 开关接口返回错误 + 无缓存（首次安装） | 用代码里的默认值，**不能崩** |

<br>

**必答**：

1. 开关的默认值应该是"新功能开"还是"新功能关"？为什么？
2. 如果开关系统本身有 Bug 导致所有开关都返回 `false`，会发生什么？
3. 灰度分流用 `uid % 100`，同一个用户会不会在两次启动间"跳组"？
   如果会，有什么后果？如何避免？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 期末项目要求

---

## 6.1 期末项目

<!-- _class: smalltext -->

自选题目，独立或 2 人组队，实现一个**完整的小程序**，
要求覆盖本课程至少 **8 个章节**的知识点。

**必须包含**：

| # | 要求 | 对应章节 |
|---|---|---|
| 1 | 分层工程结构（视图/状态/服务/基础） | 1, 5 |
| 2 | 至少 3 个自研可复用组件 + README | 3, 4 |
| 3 | 状态管理（MobX 或等价方案） | 5 |
| 4 | 带拦截器与错误分层的请求封装 | 6 |
| 5 | 完整登录鉴权链路 | 7 |
| 6 | 至少 2 个开放能力 + 降级 | 8 |
| 7 | 性能优化（含 before/after 数据） | 9 |
| 8 | 单元测试覆盖率 ≥ 60% | 12 |
| 9 | CI 流水线（lint + test + 体积检查） | 12 |
| 10 | 错误上报与功能开关 | 12 |

---

## 6.2 提交物

<!-- _class: smalltext -->

```text
学号_姓名_final/
├── src/                    # 完整源码（不含 node_modules）
├── docs/
│   ├── README.md           # 项目介绍、运行方法
│   ├── ARCHITECTURE.md     # 架构设计与分层说明
│   ├── PERFORMANCE.md      # 性能优化前后对比
│   ├── API.md              # 接口文档
│   └── CHANGELOG.md
├── tests/                  # 测试代码 + 覆盖率报告
├── .github/workflows/      # CI 配置
├── screenshots/            # 主要界面截图
└── demo.mp4                # 3 分钟功能演示（可选，加分）
```

<br>

**必须提供**：可运行的体验版二维码或完整的本地运行说明。

---

## 6.3 期末评分

<!-- _class: smalltext -->

| 维度 | 分值 | 说明 |
|---|---|---|
| **功能完整性** | 20 | 需求是否实现完整、有无明显 Bug |
| **架构与代码质量** | 25 | 分层是否清晰、组件是否可复用、命名与规范 |
| **性能** | 15 | 有实测数据、有优化过程、达到合理指标 |
| **工程化** | 20 | 测试覆盖率、CI、监控、发布流程 |
| **安全** | 10 | 无硬编码密钥、服务端鉴权、输入校验 |
| **文档** | 10 | 四份文档齐全、能让别人接手 |

<br>

**加分项**：Skyline 迁移、云开发、跨端、
真实上线并有用户数据、开源并有 Star。

---

## 6.4 本次实验评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 31 个 TODO 全部补全 | 15 |
| 2 | ESLint 零报错；自定义检查 5 条规则 + fixtures | 10 |
| 3 | Husky 拦截截图；测试不过推不上去 | 5 |
| 4 | 单测覆盖率达标（行 80% / 分支 70%），含报告截图 | 20 |
| 5 | 组件测试 4 个用例 + UI 自动化 3 个场景全部通过 | 15 |
| 6 | CI 流水线可运行，体积红线生效（附失败截图） | 10 |
| 7 | 三个 CI 踩坑记录 + IP 白名单方案分析 | 5 |
| 8 | 发布 SOP 完整（≥15 项，含回滚预案） | 10 |
| 9 | 监控三件套 + 功能开关降级演练 | 10 |

---

## 6.5 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| `wx is not defined` | setup.js 没加载或路径错 | 检查 `setupFiles` |
| `miniprogram-simulate` 报错 | 组件路径要以 `/` 开头 | `simulate.load('/components/...')` |
| automator 连不上 | 服务端口没开 | 设置 → 安全设置 |
| automator 找不到 cli | 路径不对 | Windows 是 `cli.bat` |
| 覆盖率始终为 0 | `collectCoverageFrom` 路径错 | 用相对 rootDir 的 glob |
| CI 上传 `invalid ip` | 白名单 | 见 4.3 |
| 密钥泄漏进了 git | 忘了 `.gitignore` | **立即在 MP 后台重置密钥** |
| 上报接口死循环 | 上报失败又触发上报 | 上报模块内部不许调 report |

---

## 6.6 结课寄语

<!-- _class: largetext -->

从**能写出来**，到**能长期维护、能安全上线、能持续优化**——

这就是这门课想教给你的东西。

<br>

工具会变，API 会废弃，框架会更迭。

但**度量驱动的优化思路**、**分层解耦的架构直觉**、
**对安全边界的敬畏**、**把规范变成流程的工程习惯**，
会一直有用。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验十二 · 全课程完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
