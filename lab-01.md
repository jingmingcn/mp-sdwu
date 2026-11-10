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

# 实验一 运行机制观测与工程骨架

###### “纸上得来终觉浅，绝知此事要躬行。”

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
- 任务一：工程骨架
- 任务二：生命周期观测
- 任务三：setData 基准测试
- 任务四：真机对比
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

完成本实验后，你应当能够：

1. 搭建符合课程规范的**分层工程骨架**（`utils` / `services` / `stores` / `config`）；
2. 用日志**观测**并画出 App 与 Page 生命周期的**真实执行顺序**；
3. 设计并执行 `setData` 的**基准测试**，用数据说明"条数"与"体积"哪个影响更大；
4. 说明**开发者工具与真机**的行为差异，并给出至少两处实测证据。

<br>

> 本实验对应 **第一章**。配套代码：`code-01/`

---

## 1.2 环境准备

<!-- _class: smalltext -->

| 项 | 要求 |
|---|---|
| 微信开发者工具 | 稳定版 1.06 以上 |
| 基础库 | 3.0.0 以上（调试基础库可在"本地设置"切换） |
| Node.js | 18 或 20 |
| AppID | 测试号即可（工具首页可直接申请） |
| 真机 | **必需**，任一 Android 或 iOS 手机 |

<br>

```bash
cd code-01
npm install
```

然后：开发者工具 → 导入项目 → 选择 `code-01` →
**工具 → 构建 npm** → 详情 → 本地设置 → 勾选 **使用 npm 模块**。

---

## 1.3 代码结构

<!-- _class: smalltext -->

```text
code-01/
├── app.js                 # 全局生命周期打点
├── app.json  app.wxss
├── project.config.json
├── package.json
├── config/index.js        # 环境配置（按 envVersion 切换）
├── utils/
│   ├── logger.js          # 统一日志（带时序戳）
│   ├── perf.js            # mark / measure
│   └── format.js          # 纯函数，供后续实验单测
├── services/mock.js       # 生成测试数据
└── pages/
    ├── index/             # 首页：入口
    ├── lifecycle/         # 任务二：生命周期观测
    └── bench/             # 任务三：setData 基准测试
```

打开 `code-01/README.md` 查看每个 TODO 的位置。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：工程骨架

---

## 2.1 补全 config

<!-- _class: smalltext -->

**文件**：`config/index.js`

```js
// TODO-1: 根据 __wxConfig.envVersion 返回对应配置
// 要求：develop / trial / release 三套，release 时 DEBUG 必须为 false
const ENV = __wxConfig.envVersion

const configs = {
  develop: { BASE_URL: 'https://dev-api.example.com', DEBUG: true },
  trial:   { /* TODO */ },
  release: { /* TODO */ }
}

module.exports = { ...(configs[ENV] || configs.release), ENV }
```

<br>

**验证**：在开发者工具里 `console.log(require('./config'))`，
应输出 `develop` 的配置且 `ENV === 'develop'`。

---

## 2.2 补全 logger

<!-- _class: smalltext -->

**文件**：`utils/logger.js`

要求：

1. 输出格式为 `[+123ms][App] onLaunch`，其中 `+123ms` 是**距 App 启动的毫秒数**；
2. `DEBUG` 为 false 时，`log()` / `debug()` 静默，`error()` 仍输出；
3. 不依赖 `wx.*`（为了第十二章能单测）。

```js
const { DEBUG } = require('../config')
const T0 = Date.now()

function stamp() {
  // TODO-2: 返回形如 '[+123ms]' 的字符串
}

exports.log = function (scope, ...args) {
  // TODO-3: DEBUG 为真时输出 `${stamp()}[${scope}]`, ...args
}
exports.error = function (scope, ...args) { console.error(stamp(), `[${scope}]`, ...args) }
```

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：生命周期观测

---

## 3.1 打点

在 `app.js` 与 `pages/lifecycle/lifecycle.js` 的**每一个**生命周期里调用 `log()`：

<!-- _class: smalltext -->

```js
// app.js
const { log } = require('./utils/logger')
App({
  onLaunch(options) { log('App', 'onLaunch', options.path) },
  onShow(options)   { log('App', 'onShow', 'scene=' + options.scene) },
  onHide()          { log('App', 'onHide') },
  onError(e)        { log('App', 'onError', e) },
  onPageNotFound(r) { log('App', 'onPageNotFound', r.path) }
})
```

```js
// pages/lifecycle/lifecycle.js —— 用 Component 构造器写页面
Component({
  methods: {
    onLoad(q)   { log('Page', 'onLoad', JSON.stringify(q)) },
    onShow()    { log('Page', 'onShow') },
    onReady()   { log('Page', 'onReady') },
    onHide()    { log('Page', 'onHide') },
    onUnload()  { log('Page', 'onUnload') }
  }
})
```

页面里还挂了一个自定义组件 `lifecycle-probe`，同样打点 `created/attached/ready/detached`。

---

## 3.2 要记录的四个场景

<!-- _class: smalltext -->

| # | 操作 | 记录什么 |
|---|---|---|
| ① | **冷启动**进入 lifecycle 页 | App 与 Page 全部钩子的顺序与时间戳 |
| ② | 从 lifecycle 页 `navigateTo` 到另一页再返回 | 哪些钩子重跑、哪些不跑 |
| ③ | 按 Home 键切后台 5 秒再切回 | `App.onHide/onShow` 与 `Page.onHide/onShow` |
| ④ | `navigateBack` 离开页面 | `onUnload` 与组件 `detached` 的先后 |

<br>

**产出**：把四个场景的控制台输出**截图**，并整理成一张**时序表**放进实验报告。

---

## 3.3 必须回答的问题

<!-- _class: smalltext -->

在 `pages/lifecycle/lifecycle.js` 里已经埋好了两段代码：

```js
onLoad() {
  // TODO-4: 在这里调用 createSelectorQuery 查询 .box 的尺寸，观察结果
  this.createSelectorQuery().select('.box').boundingClientRect(r => {
    log('Page', 'onLoad 查询节点结果 =', JSON.stringify(r))
  }).exec()
},
onReady() {
  // TODO-5: 同样的查询放在 onReady
}
```

<br>

**问题 1**：两次查询的结果分别是什么？为什么？
**问题 2**：父组件的 `ready` 和子组件的 `ready` 谁先执行？和 `created` 的顺序一样吗？

---

## 3.4 清理逻辑验证

<!-- _class: smalltext -->

页面里有一个每秒自增的计时器：

```js
onLoad() {
  this._timer = setInterval(() => {
    this._tick = (this._tick || 0) + 1
    log('Timer', 'tick', this._tick)
    this.setData({ tick: this._tick })
  }, 1000)
},
onUnload() {
  // TODO-6: 先注释掉清理代码，观察离开页面后控制台的变化
  // clearInterval(this._timer)
}
```

<br>

**实验**：

1. 注释掉 `clearInterval`，进入页面 5 秒后返回，观察控制台；
2. 记录出现的**错误信息原文**；
3. 恢复 `clearInterval`，确认错误消失。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：setData 基准测试

---

## 4.1 测试页面

`pages/bench/bench.js` 已经提供了框架：

<!-- _class: smalltext -->

```js
Component({
  data: { list: [], result: [] },
  methods: {
    // 测一次 setData 的往返耗时
    measureOnce(payload) {
      return new Promise(resolve => {
        const t0 = Date.now()
        this.setData(payload, () => resolve(Date.now() - t0))
      })
    },

    async runCase({ name, build }) {
      await this.reset()
      const payload = build()
      const size = JSON.stringify(payload).length
      const ms = await this.measureOnce(payload)
      return { name, size, ms }
    }
  }
})
```

---

## 4.2 必测的六组用例

<!-- _class: smalltext -->

```js
// TODO-7: 补全 CASES
const CASES = [
  { name: 'A 100条 × 精简字段',  build: () => ({ list: mock(100, 'lean') }) },
  { name: 'B 100条 × 冗余字段',  build: () => ({ list: mock(100, 'fat') }) },
  { name: 'C 2000条 × 精简字段', build: () => ({ list: mock(2000, 'lean') }) },
  { name: 'D 2000条 × 冗余字段', build: () => ({ list: mock(2000, 'fat') }) },
  { name: 'E 数据路径改1个字段', build: () => ({ 'list[0].title': '改过了' }) },
  { name: 'F 连续3次 vs 合并1次', build: null }   // 需要特殊处理
]
```

`mock(n, mode)` 在 `services/mock.js` 里：
`lean` 每项 3 个字段，`fat` 每项额外带一个 200 字符的 `desc` 和一个 20 元素的 `tags`。

---

## 4.3 记录表格

把结果整理成下表（**开发者工具 + 至少一台真机**各一份）：

<!-- _class: smalltext -->

| 用例 | 数据量(字节) | 耗时(ms) | 相对 A 的倍数 |
|---|---|---|---|
| A 100 精简 | | | 1.0 |
| B 100 冗余 | | | |
| C 2000 精简 | | | |
| D 2000 冗余 | | | |
| E 单字段路径 | | | |
| F 3 次 vs 1 次 | | | |

<br>

每个用例**跑 5 次取中位数**，`runAll()` 已经帮你做了。

---

## 4.4 要得出的结论

根据你的数据回答：

1. **条数**翻 20 倍（A→C）耗时增加几倍？**体积**翻若干倍（A→B）呢？
   哪个是主导因素？
2. 用例 E 的耗时与 C 相比是多少？这说明数据路径的价值有多大？
3. 用例 F 中"3 次分开"与"1 次合并"的差值，
   能否近似认为是**单次跨线程通信的固定开销**？请给出估计值。

<br>

> 结论必须**基于你自己的数据**，不要抄课件上的数字——
> 不同机型差异可以很大，这正是要真机测的原因。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：真机对比

---

## 5.1 至少找出两处差异

<!-- _class: smalltext -->

在 `pages/index/index.js` 里已提供探测代码：

```js
// TODO-8: 逐个执行并记录工具与真机的输出差异
const probes = {
  hasWindow:   () => typeof window,
  hasDocument: () => typeof document,
  dateParse:   () => String(new Date('2026-01-01 10:00:00')),
  dateParseISO:() => String(new Date('2026-01-01T10:00:00')),
  regexLookbehind: () => { try { new RegExp('(?<=a)b'); return 'ok' } catch (e) { return 'fail' } },
  sdkVersion:  () => wx.getAppBaseInfo().SDKVersion,
  pixelRatio:  () => wx.getWindowInfo().pixelRatio,
  system:      () => wx.getDeviceInfo().system
}
```

<br>

**必答**：`new Date('2026-01-01 10:00:00')` 在 iOS 上是什么结果？
为什么？给出一个**跨端安全**的日期解析写法。

---

## 5.2 真机调试方法

```js
// 打开真机 vConsole
wx.setEnableDebug({ enableDebug: true })
```

<br>

三种真机调试方式：

| 方式 | 适用 |
|---|---|
| **预览**（扫码） | 快速看效果，日志靠 vConsole |
| **真机调试** | 可打断点、看 Network，**但性能数据不准** |
| **体验版** | 最接近线上，性能测试**必须用它** |

**性能基准测试请用「预览」或「体验版」，不要用「真机调试」**——
调试模式下逻辑层被代理，耗时会显著失真。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 验收标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 8 个 TODO 全部补全，工程能在真机运行 | 20 |
| 2 | 四个场景的生命周期时序表完整且正确 | 20 |
| 3 | `onLoad` / `onReady` 节点查询差异的解释正确 | 10 |
| 4 | 未清理定时器的错误信息已复现并记录 | 10 |
| 5 | 六组基准测试数据完整（工具 + 真机各一份） | 20 |
| 6 | 三条结论有数据支撑，不是复述课件 | 15 |
| 7 | 至少两处工具/真机差异，含跨端安全的日期写法 | 5 |

---

## 6.2 提交物

```text
学号_姓名_lab01/
├── code-01/              # 你补全后的工程（去掉 node_modules 与 miniprogram_npm）
├── report.md             # 实验报告
└── screenshots/
    ├── lifecycle-cold.png
    ├── lifecycle-back.png
    ├── lifecycle-hide.png
    ├── lifecycle-unload.png
    ├── bench-devtool.png
    └── bench-device.png
```

<br>

报告用 Markdown，包含：环境说明（机型、系统、基础库版本）、
四张时序表、两张数据表、三条结论、遇到的问题与解决过程。

---

## 6.3 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 构建 npm 后 `require` 仍报错 | 没勾选"使用 npm 模块" | 详情 → 本地设置 |
| `__wxConfig is not defined` | 在单测环境里跑了小程序代码 | 该文件不该被单测直接引用 |
| 真机 setData 耗时波动大 | 用了"真机调试"模式 | 改用"预览" |
| 2000 条 fat 数据直接卡死 | 单次 setData 超过限制 | 这正是要观测的现象，记录下来 |
| 回调不触发 | 页面已 `onUnload` | 检查是否忘了清理 |

---

## 6.4 拓展（选做，加分）

1. 用 `wx.getPerformance()` 的 `PerformanceObserver` 采集 `render` / `script` 条目，
   与你自己 `Date.now()` 的测量做对比，误差有多大？
2. 把 `list` 换成**嵌套三层**的对象结构，重跑 C/D 两组，
   序列化成本是否随嵌套深度增加？
3. 写一个 `setDataSafe(payload)`，当 `JSON.stringify(payload).length > 64KB` 时
   在控制台警告并打印最大的三个字段名。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验一 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
