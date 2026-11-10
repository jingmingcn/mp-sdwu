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

# 实验六 带拦截器的请求库

###### “工欲善其事，必先利其器。”

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
- 任务一：核心与拦截器
- 任务二：错误分层与重试
- 任务三：并发、去重与取消
- 任务四：缓存策略
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 从零实现一个带**拦截器链**的请求库，理解 Promise 链式组装；
2. 实现**网络 / HTTP / 业务**三层错误的归一与**指数退避重试**；
3. 实现**并发限流、请求去重、取消、竞态防护**；
4. 实现 **Cache-First / Network-First / SWR** 三种缓存策略并对比效果。

<br>

> 对应 **第六章**。配套代码：`code-06/`

---

## 1.2 准备：本地 Mock 服务器

<!-- _class: smalltext -->

`code-06/server/` 提供了一个 Node Mock 服务器，
可以**按需制造**慢响应、超时、5xx、401、业务错误。

```bash
cd code-06/server
npm install
npm start          # http://localhost:3000
```

| 路由 | 行为 |
|---|---|
| `GET /goods?page=1` | 正常返回列表 |
| `GET /slow?ms=3000` | 延迟指定毫秒 |
| `GET /flaky?rate=0.5` | 按概率返回 500 |
| `GET /secure` | 需要有效 token，否则 401 |
| `POST /auth/login` | 用 code 换 token（模拟） |
| `GET /biz-error` | HTTP 200 但 `code !== 0` |

开发者工具需勾选**不校验合法域名**（本地调试）。

---

## 1.3 代码结构

```text
code-06/
├── request/
│   ├── index.js         # http 实例
│   ├── interceptor.js   # InterceptorManager
│   ├── adapter.js       # 包装 wx.request
│   ├── error.js         # ApiError
│   ├── retry.js
│   ├── queue.js         # 并发队列
│   ├── dedupe.js
│   └── signal.js        # 取消
├── utils/storage.js     # 带 TTL 的封装
├── services/            # 业务接口
├── server/              # Mock 服务器
└── pages/playground/    # 逐项验证的测试页
```

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：核心与拦截器

---

## 2.1 InterceptorManager

<!-- _class: smalltext -->

**文件**：`request/interceptor.js`

```js
class InterceptorManager {
  constructor() { this.handlers = [] }

  // TODO-1: 注册，返回可用于 eject 的 id
  use(onFulfilled, onRejected) { }

  // TODO-2: 注销（置 null，不要用 splice —— 会让已有 id 错位）
  eject(id) { }

  // TODO-3: 遍历（跳过已注销的）
  forEach(fn) { }
}
module.exports = { InterceptorManager }
```

<br>

**思考**：为什么 `eject` 要置 `null` 而不是 `splice`？
请构造一个 `splice` 会出错的场景。

---

## 2.2 组装 Promise 链

<!-- _class: smalltext -->

**文件**：`request/index.js`

```js
function dispatch(config) {
  // TODO-4: 按 axios 的方式组装
  // chain = [ ...请求拦截器(倒序), adapter, undefined, ...响应拦截器(正序) ]
  // 然后 reduce 成 promise 链
  const chain = [adapter, undefined]
  http.interceptors.request.forEach(h => chain.unshift(h.onFulfilled, h.onRejected))
  http.interceptors.response.forEach(h => chain.push(h.onFulfilled, h.onRejected))

  let promise = Promise.resolve(config)
  while (chain.length) promise = promise.then(chain.shift(), chain.shift())
  return promise
}
```

<br>

**必答**：为什么请求拦截器要 `unshift`（倒序），响应拦截器要 `push`（正序）？
如果都用 `push` 会怎样？画一张执行顺序图。

---

## 2.3 三个必写的拦截器

<!-- _class: smalltext -->

```js
// TODO-5: 注入 token 与 X-Request-Id
http.interceptors.request.use(config => { })

// TODO-6: 统一 loading（用计数器，防止并发时闪烁）
//   要求：config.loading === false 时跳过；多个并发请求只显示一次 loading
let pending = 0
http.interceptors.request.use(config => { })
http.interceptors.response.use(res => { }, err => { })

// TODO-7: 响应归一
//   HTTP 401       → 走 token 刷新（任务二）
//   HTTP 非 2xx    → 抛 ApiError({ type:'HTTP' })
//   data.code !== 0 → 抛 ApiError({ type:'BIZ' })
//   正常           → 直接 return data.data（业务层不用解包）
http.interceptors.response.use(res => { })
```

---

## 2.4 验证

在 `pages/playground` 里点击对应按钮，控制台应看到：

```text
[req] GET /goods  headers: { Authorization: 'Bearer ...', X-Request-Id: '...' }
[loading] show (pending=1)
[loading] show skipped (pending=2)      ← 第二个并发请求不重复弹
[res] /goods 200 code=0
[loading] hide (pending=0)
```

<br>

**必做实验**：同时发 5 个请求，
确认 `wx.showLoading` **只调用一次**、`wx.hideLoading` **只调用一次**。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：错误分层与重试

---

## 3.1 ApiError

<!-- _class: smalltext -->

**文件**：`request/error.js`

```js
class ApiError extends Error {
  constructor({ type, message, code, statusCode, config }) {
    super(message)
    this.name = 'ApiError'
    this.type = type          // NETWORK | TIMEOUT | HTTP | BIZ | ABORT
    // TODO-8: 补全其余字段
  }

  // TODO-9: 是否可重试
  //   NETWORK / TIMEOUT / HTTP 5xx → true
  //   HTTP 4xx / BIZ / ABORT       → false
  get isRetryable() { }

  // TODO-10: 给用户看的文案
  //   NETWORK → '网络不给力，请检查后重试'
  //   TIMEOUT → '请求超时，请重试'
  //   HTTP    → '服务暂时不可用'
  //   BIZ     → 用后端的 message
  get userMessage() { }
}
```

---

## 3.2 三层错误的分辨实验

<!-- _class: smalltext -->

依次请求下列地址并记录 `err.type`：

| 请求 | 期望 type |
|---|---|
| `GET /goods`（服务器已停） | `NETWORK` |
| `GET /slow?ms=15000`（timeout 设 3000） | `TIMEOUT` |
| `GET /not-exist` | `HTTP`，statusCode 404 |
| `GET /flaky?rate=1`（必 500） | `HTTP`，statusCode 500 |
| `GET /biz-error` | `BIZ`，code=40001 |
| 请求发出后立即 `abort()` | `ABORT` |

<br>

**必答**：`wx.request` 的 `fail` 回调对应上表的哪几行？
`success` 回调又对应哪几行？

---

## 3.3 指数退避重试

<!-- _class: smalltext -->

**文件**：`request/retry.js`

$$
\text{delay}_n = \min(\text{base} \times 2^{n},\ \text{maxDelay}) + \text{jitter}
$$

```js
// TODO-11: 挂到响应拦截器上
http.interceptors.response.use(null, async err => {
  const { config } = err
  // 1. config.retry === false 或 !err.isRetryable → 直接抛
  // 2. 已重试次数 > config.retry（默认 2）→ 直接抛
  // 3. 计算 delay（含 0~100ms 抖动）后重放
})
```

<br>

**验证**：请求 `GET /flaky?rate=0.7`，打开日志观察重试序列：

```text
[retry] 第 1 次失败，300ms 后重试
[retry] 第 2 次失败，650ms 后重试
[retry] 第 3 次失败，放弃
```

记录**重试成功率**：`rate=0.7` 时，重试 2 次的最终成功率理论值是多少？实测是多少？

---

## 3.4 401 刷新的并发合并

<!-- _class: smalltext -->

```js
let refreshing = null

// TODO-12: 实现 handle401
async function handle401(config) {
  // 1. 已重放过一次仍 401 → 跳登录并抛错
  // 2. 若无正在进行的刷新，发起一次；否则复用
  // 3. 刷新完成后用新 token 重放原请求
}

// TODO-13: 实现 doRefresh —— 用 wx.login 拿 code 换新 token
async function doRefresh() { }
```

<br>

**关键验证**：同时发 **6 个** `GET /secure` 请求（token 已过期），
在 Mock 服务器的日志里确认 `/auth/login` **只被调用 1 次**。

**截图两份日志**（客户端 + 服务器）作为证据。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：并发、去重与取消

---

## 4.1 并发队列

<!-- _class: smalltext -->

**文件**：`request/queue.js`

```js
class TaskQueue {
  constructor(limit = 6) { }
  // TODO-14: push 返回 Promise，内部排队
  push(taskFn) { }
  // TODO-15: _next 取出任务执行，完成后递归
  _next() { }
}
```

**验证实验**：

```js
// 同时发起 20 个 /slow?ms=1000 请求
const t0 = Date.now()
await Promise.all(Array.from({ length: 20 }, () => http.get('/slow', { ms: 1000 })))
console.log('总耗时', Date.now() - t0)
```

| limit | 理论耗时 | 实测耗时 |
|---|---|---|
| 不限流（靠微信的 10） | ~2s | |
| 6 | ~4s | |
| 2 | ~10s | |

---

## 4.2 请求去重

<!-- _class: smalltext -->

**文件**：`request/dedupe.js`

```js
const inflight = new Map()

// TODO-16: key = method|url|JSON(data)
function keyOf(config) { }

// TODO-17: 只对 GET 生效；config.dedupe === false 时跳过
//   同 key 的在途请求复用同一个 Promise，完成后清理
function dedupe(config, exec) { }
```

<br>

**验证**：

```js
// 同时发 3 个完全相同的请求
const [a, b, c] = await Promise.all([
  http.get('/goods', { page: 1 }),
  http.get('/goods', { page: 1 }),
  http.get('/goods', { page: 1 })
])
// 服务器日志里应只有 1 条记录
console.log(a === b, b === c)      // 期望 true true
```

---

## 4.3 取消与竞态

<!-- _class: smalltext -->

```js
// request/signal.js
class RequestSignal {
  constructor() { this.tasks = new Set(); this.aborted = false }
  // TODO-18: bind —— 若已 aborted 则立即 abort 新 task
  bind(task) { }
  // TODO-19: abort —— 取消全部在途任务
  abort() { }
}
```

**搜索框实验**（`pages/playground/search`）：

```js
// TODO-20: 输入时先 abort 上一次，再发新请求
// TODO-21: 同时用序号法丢弃过期结果
onInput(e) {
  this._signal && this._signal.abort()
  this._signal = new RequestSignal()
  const seq = ++this._seq
  http.get('/search', { kw: e.detail.value }, { signal: this._signal })
    .then(list => { if (seq === this._seq) this.setData({ list }) })
    .catch(err => { if (err.type !== 'ABORT') this.showError(err) })
}
```

---

## 4.4 竞态验证

<!-- _class: smalltext -->

Mock 服务器的 `/search` 会**按关键词长度反向延迟**：
关键词越短，返回越慢。

<br>

**实验**：在输入框里快速输入 `a` → `ab` → `abc`

| 实现 | 最终显示的结果 |
|---|---|
| 不做任何处理 | `a` 的结果（**错误**） |
| 只用 abort | |
| 只用序号法 | |
| 两者都用 | `abc` 的结果（正确） |

<br>

**必答**：只用 `abort` 时，还存在什么漏洞？
（提示：`abort` 发出到真正生效之间有时间窗口）

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：缓存策略

---

## 5.1 带 TTL 的 Storage

<!-- _class: smalltext -->

**文件**：`utils/storage.js`

```js
const PREFIX = 'app:'

// TODO-22: 存储时包一层 { v: value, e: expireAt }
function setItem(key, value, ttlMs) { }

// TODO-23: 读取时检查过期，过期则删除并返回默认值
function getItem(key, defaultValue = null) { }

// TODO-24: 写入失败（超限）时清理过期项后重试一次
async function safeSet(key, value, ttl) { }

// TODO-25: 遍历所有 PREFIX 开头的 key，删除已过期的
function purgeExpired() { }
```

<br>

**提示**：`wx.getStorageInfoSync().keys` 可以列出所有 key。

---

## 5.2 三种策略

<!-- _class: smalltext -->

```js
// services/cache.js

// TODO-26: Cache First —— 有缓存直接返回，无则请求并写缓存
async function cacheFirst(key, fetcher, ttl) { }

// TODO-27: Network First —— 先请求，失败降级到缓存
async function networkFirst(key, fetcher, ttl) { }

// TODO-28: SWR —— 立即返回缓存并后台刷新
async function swr(key, fetcher, { ttl, onUpdate }) { }
```

<br>

**测试页**：`pages/playground/cache` 三个按钮 + 一个"清空缓存"按钮，
每次点击记录：**是否命中缓存**、**耗时**、**数据来源**。

---

## 5.3 对比实验

在 `/slow?ms=1500` 上分别跑三种策略，各点 3 次：

<!-- _class: smalltext -->

| 策略 | 第 1 次 | 第 2 次 | 第 3 次 | 断网时 |
|---|---|---|---|---|
| 无缓存 | 1500ms | 1500ms | 1500ms | 失败 |
| Cache First | | | | |
| Network First | | | | |
| SWR | | | | |

<br>

**必答**：

1. SWR 的第 2 次耗时是多少？用户看到的内容是新的还是旧的？
2. Network First 在**弱网**（延迟 5s）下的体验为什么比 SWR 差？
3. 什么数据**不能**用 Cache First？举两个例子。

---

## 5.4 SWR 的二次更新处理

<!-- _class: smalltext -->

```js
const data = await swr('feed', () => http.get('/goods'), {
  ttl: 60_000,
  onUpdate: fresh => {
    // TODO-29: 只在数据确实变化时才 setData，避免列表无谓跳动
    // 提示：算一个轻量签名（id 序列 + 更新时间）做比较
  }
})
```

<br>

**验证**：连续点两次"SWR"按钮，
第二次的后台刷新如果数据没变，控制台应打印 `[swr] 数据未变化，跳过 setData`。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 29 个 TODO 全部补全，playground 各项可跑通 | 20 |
| 2 | 拦截器链顺序正确，附执行顺序图与并发 loading 验证 | 15 |
| 3 | 三层错误分辨表完整（6 行），`fail`/`success` 归属回答正确 | 10 |
| 4 | 重试有退避与抖动，成功率理论值与实测对比 | 10 |
| 5 | 401 并发合并**服务器日志证明只登录 1 次** | 15 |
| 6 | 并发限流三组数据 + 去重验证（服务器日志 1 条） | 10 |
| 7 | 竞态实验四组结果 + `abort` 漏洞分析 | 10 |
| 8 | 三种缓存策略对比表完整 + 三个必答问题 | 10 |

---

## 6.2 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 拦截器不执行 | `use` 返回值没接、或 chain 组装顺序错 | 打印 chain 长度核对 |
| loading 一直不消失 | 错误分支里忘了减计数 | `response.use(ok, err)` 两条都要处理 |
| 重试无限循环 | 重放时没带 `_retryCount` | 计数挂在 `config` 上并透传 |
| 401 触发多次登录 | 没做 Promise 合并 | 用模块级变量存 `refreshing` |
| 去重后拿到过期数据 | 缓存了 Promise 但没在 finally 清理 | `.finally(() => inflight.delete(key))` |
| `abort` 后仍走了 success | task 尚未创建就调了 abort | `signal.bind` 里判断 `aborted` |
| Storage 写入报错 | 超过 10MB | 实现 `purgeExpired` 并重试 |

---

## 6.3 拓展（选做，加分）

1. 实现 **`uploadFile` 的统一封装**：自动压缩、进度回调、`res.data` 字符串解析、
   失败重试（注意上传不能盲目重试，要考虑服务端幂等）；
2. 实现 **离线队列**：断网时把 POST 请求排进队列，
   `wx.onNetworkStatusChange` 恢复后自动重放（注意幂等与顺序）；
3. 给请求库加**慢请求上报**：超过阈值的请求自动上报 url/耗时/网络类型；
4. 实现一个 **Mock 拦截器**：`config.mock = true` 时不发真实请求，
   直接返回本地 fixture，便于无服务端时开发。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验六 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
