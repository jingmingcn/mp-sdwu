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

# 实验七 登录鉴权全链路

###### “千里之堤，溃于蚁穴。”

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
- 任务一：服务端登录接口
- 任务二：客户端登录态
- 任务三：无感续期与页面鉴权
- 任务四：安全攻防演练
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 实现完整的 `wx.login` → `code2Session` → **自定义登录态**链路（含服务端）；
2. 实现 **access token + refresh token** 双令牌与**无感续期**；
3. 实现**页面级鉴权 behavior**，并处理"登录后回到原页面"；
4. 通过**攻防演练**理解：前端权限只是体验，服务端鉴权才是安全边界。

<br>

> 对应 **第七章**。配套代码：`code-07/`

---

## 1.2 结构

<!-- _class: smalltext -->

```text
code-07/
├── miniprogram/
│   ├── services/auth.js       # 登录、登出、token 管理
│   ├── behaviors/auth-required.js
│   ├── request/               # 复用实验六的请求库
│   └── pages/
│       ├── index/             # 首页（无需登录）
│       ├── profile/           # 需要登录
│       ├── login/             # 登录引导页
│       └── attack/            # 任务四：攻防演练
└── server/
    ├── index.js               # Express
    ├── wx.js                  # code2Session（含 Mock 模式）
    ├── token.js               # JWT 签发与校验
    └── store.js               # 内存版用户表 + refresh 表
```

---

## 1.3 服务端启动

```bash
cd code-07/server
npm install
cp .env.example .env
npm start                  # http://localhost:3000
```

<!-- _class: smalltext -->

```bash
# .env
WX_APPID=wxdev_mock
WX_SECRET=mock_secret_do_not_commit
JWT_SECRET=change-me-in-production
MOCK_WX=true               # true 时不真的调微信接口，本地即可完成实验
```

<br>

**注意**：`.env` 已在 `.gitignore` 中。
**提交作业时不要包含任何真实的 AppSecret。**

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：服务端登录接口

---

## 2.1 code2Session

<!-- _class: smalltext -->

**文件**：`server/wx.js`

```js
const axios = require('axios')

// TODO-1: 调 jscode2session
//   MOCK_WX=true 时不发真实请求，直接由 code 推导出稳定的 openid
//   （例如 openid = 'mock_' + sha1(code).slice(0,16)，同一 code 得到同一 openid）
async function code2Session(code) {
  if (process.env.MOCK_WX === 'true') {
    // TODO
  }
  const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: { appid: process.env.WX_APPID, secret: process.env.WX_SECRET,
              js_code: code, grant_type: 'authorization_code' }
  })
  if (data.errcode) throw Object.assign(new Error(data.errmsg), { code: data.errcode })
  return data     // { openid, unionid?, session_key }
}
```

**必答**：为什么 `WX_SECRET` 只能出现在服务端？
如果它出现在小程序代码里，攻击者能做什么？（列举至少三件事）

---

## 2.2 双令牌

<!-- _class: tinytext -->

**文件**：`server/token.js`

```js
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// access token：JWT，2 小时，无状态
// TODO-2: 签发
function signAccess(uid) { }
// TODO-3: 校验，返回 uid 或抛错
function verifyAccess(token) { }

// refresh token：不透明随机串，7 天，存服务端（可吊销）
// TODO-4: 签发并写入 store
function issueRefresh(uid) {
  const token = crypto.randomBytes(32).toString('hex')
  // store.refresh.set(token, { uid, expireAt })
  return token
}
// TODO-5: 消费（一次性：用过即作废并签发新的 —— refresh token rotation）
function consumeRefresh(token) { }
// TODO-6: 吊销某用户的全部 refresh（登出/封禁时用）
function revokeAll(uid) { }
```

<br>

**必答**：`refresh token rotation`（每次刷新都换新的）能防住什么攻击？

---

## 2.3 三个接口

<!-- _class: smalltext -->

```js
// server/index.js

// TODO-7: POST /auth/login  { code } → { accessToken, refreshToken, expiresIn, user }
app.post('/auth/login', async (req, res) => { })

// TODO-8: POST /auth/refresh  { refreshToken } → 新的一对 token
//   注意：refreshToken 无效/过期/已使用过 → 401
app.post('/auth/refresh', async (req, res) => { })

// TODO-9: POST /auth/logout  → 吊销该用户全部 refresh token
app.post('/auth/logout', auth, async (req, res) => { })
```

```js
// 鉴权中间件
// TODO-10: 从 Authorization: Bearer <token> 取出并校验，把 uid 挂到 req.uid
function auth(req, res, next) { }
```

<br>

**关键**：`session_key` 存在服务端的 `store`，**永远不出现在响应体里**。
请在报告里贴出 `/auth/login` 的完整响应，证明这一点。

---

## 2.4 受保护的业务接口

```js
// TODO-11: GET /profile —— 返回当前用户信息
//   ⚠ 必须用 req.uid，不能用 req.query.uid
app.get('/profile', auth, (req, res) => { })

// TODO-12: GET /orders —— 返回当前用户的订单
//   同样：只能用 req.uid
app.get('/orders', auth, (req, res) => { })

// TODO-13: POST /admin/reset —— 仅管理员可调用
//   ⚠ 管理员标志来自数据库里的用户记录，不能来自请求参数
app.post('/admin/reset', auth, (req, res) => { })
```

<br>

这三个接口在**任务四**里会被攻击，现在把它们写对。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：客户端登录态

---

## 3.1 auth service

<!-- _class: smalltext -->

**文件**：`miniprogram/services/auth.js`

```js
const ACCESS = 'auth:access', REFRESH = 'auth:refresh', USER = 'auth:user'

// TODO-14: 静默登录
//   1. wx.checkSession 有效且本地有 access token → 直接返回
//   2. 否则 wx.login 拿 code，调 /auth/login
//   3. 存 token（access 带 TTL，refresh 带 7 天 TTL）
export async function login() { }

// TODO-15: 确保已登录（供 App.onLaunch 与页面使用）
//   要求：并发调用只发起一次真实登录
export function ensureLogin() { }

// TODO-16: 登出 —— 调服务端吊销 + 清本地 + 清各 store
export async function logout() { }

export const getAccess = () => getItem(ACCESS)
export const getUser = () => getItem(USER)
```

---

## 3.2 wx.checkSession 的正确用法

<!-- _class: smalltext -->

```js
// ✗ 每次 onShow 都 login —— 会让服务端已有的 session_key 立即失效
onShow() { wx.login({ success: r => refresh(r.code) }) }

// ✓ 先检查
// TODO-17: 实现 isSessionValid
async function isSessionValid() {
  return new Promise(r => wx.checkSession({ success: () => r(true), fail: () => r(false) }))
}
```

<br>

**实验**：写一段代码，先 `wx.login()` 两次，
然后用**第一次**的 code 调 `/auth/login`，记录服务端返回的错误码。

**必答**：这个实验说明了 `code` 的什么特性？

---

## 3.3 App 里的登录

```js
// app.js
App({
  onLaunch() {
    // TODO-18: 发起静默登录但不阻塞首屏，把 Promise 挂在 App 上
    this.loginReady = ensureLogin().catch(e => {
      console.error('[auth] 静默登录失败', e)
      return null
    })
  }
})
```

```js
// 需要登录态的页面
async onLoad() {
  await getApp().loginReady          // 复用同一个 Promise
  this.loadData()
}
```

<br>

**验证**：在 5 个页面同时 `await getApp().loginReady`，
服务器日志里 `/auth/login` **只应出现 1 次**。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：无感续期与页面鉴权

---

## 4.1 401 拦截器

<!-- _class: smalltext -->

```js
// request 的响应拦截器里
let refreshing = null

// TODO-19: 实现 handle401
async function handle401(config) {
  // 1. config._retried 为真 → 说明刷新后仍 401，走重新登录
  // 2. 并发合并：只发起一次 /auth/refresh
  // 3. refresh 也失败 → 降级到 wx.login 重新静默登录
  // 4. 都失败 → 清本地态，跳登录引导页
}
```

<br>

**测试方法**：服务器提供 `POST /debug/expire-token`，
调用后当前 access token 立即失效。

**验证步骤**：

1. 正常登录；
2. 调 `/debug/expire-token`；
3. 同时发起 6 个 `/profile` 请求；
4. 服务器日志里 `/auth/refresh` **只应有 1 条**，6 个请求**全部成功**；
5. **用户界面上没有任何"请重新登录"的提示**。

---

## 4.2 页面鉴权 behavior

<!-- _class: smalltext -->

```js
// behaviors/auth-required.js
module.exports = Behavior({
  data: { _authReady: false },
  lifetimes: {
    async attached() {
      // TODO-20:
      // 1. 已登录 → 直接放行
      // 2. 未登录 → 尝试静默登录
      // 3. 静默登录失败（需要用户交互）→ 记住当前页面路径，跳登录页
      // 4. 放行后调用 this.onAuthReady()
    }
  },
  methods: {
    // TODO-21: 记录当前页面完整路径（含 query），登录成功后要回来
    _rememberRedirect() { }
  }
})
```

```js
// pages/profile/profile.js
Component({
  behaviors: [require('../../behaviors/auth-required')],
  methods: { onAuthReady() { this.loadProfile() } }
})
```

---

## 4.3 登录后回跳

<!-- _class: smalltext -->

```js
// pages/login/login.js
methods: {
  async onLoginTap() {
    // TODO-22: 完成登录后回到来源页
    //   注意：来源页可能是 tabBar 页（要用 switchTab）也可能是普通页（redirectTo）
    //   注意：来源页可能已经在页面栈里 —— 想想用 navigateBack 还是 redirectTo
    await login()
    const redirect = wx.getStorageSync('auth:redirect')
    // ...
  }
}
```

<br>

**必做的三个场景验证**：

| 来源 | 期望行为 |
|---|---|
| 从首页点"我的"（tabBar） | 登录后停在"我的"页 |
| 从商品详情点"立即购买" | 登录后回到该商品详情页，**query 不丢** |
| 直接扫码进入需登录的页面 | 登录后进入该页，不是回首页 |

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：安全攻防演练

---

## 5.1 攻击一：越权访问

<!-- _class: smalltext -->

`pages/attack/attack` 提供了一个"攻击面板"。

```js
// TODO-23: 用别人的 uid 拉数据
//   服务端如果写成 GET /orders?uid=xxx 就会中招
await http.get('/orders', { uid: 999 })
```

<br>

**要做的事**：

1. 先把服务端 `/orders` **故意**改成用 `req.query.uid`；
2. 在攻击面板里传一个别人的 uid，**截图证明能拿到别人的订单**；
3. 改回用 `req.uid`；
4. 再次攻击，**截图证明失败**。

**报告里要写**：这个漏洞在真实项目里会造成什么后果？

---

## 5.2 攻击二：篡改本地状态

<!-- _class: smalltext -->

```js
// TODO-24: 直接改本地存储里的用户信息
wx.setStorageSync('auth:user', { ...getUser(), isAdmin: true })
```

<br>

**观察**：

1. 前端界面上"管理员入口"按钮是否出现了？
2. 点击它调用 `/admin/reset`，服务端返回什么？

<br>

**必答**：

- 前端 `wx:if="{{user.isAdmin}}"` 属于什么？（安全措施 / 体验优化）
- 服务端如何保证 `isAdmin` 不可伪造？

---

## 5.3 攻击三：伪造 token

<!-- _class: smalltext -->

```js
// TODO-25: 手工构造一个 JWT
//   1. 把 header/payload base64 解码，改 uid，再编码回去，签名保持原样
//   2. 用它调 /profile，记录结果
//   3. 把服务端的 JWT_SECRET 改成 'test'，用同样的 secret 在客户端签一个，再试
```

<br>

**要回答的**：

1. 只改 payload 不改签名，服务端为什么能识破？
2. 如果 `JWT_SECRET` 泄漏了，攻击者能做什么？怎么应急？
3. JWT 的 payload 是**加密**的还是仅**编码**的？
   请把你的 token 粘到 base64 解码里看看，**能看到什么**？
   这对"payload 里能放什么"有什么约束？

---

## 5.4 攻击四：重放

<!-- _class: smalltext -->

服务器提供 `POST /checkin`（签到领 10 积分）。

```js
// TODO-26: 连续调用 20 次
for (let i = 0; i < 20; i++) await http.post('/checkin')
```

<br>

**第一步**：不加任何防护，记录积分变成多少。

**第二步**：实现防护（三选一或全做）：

| 手段 | 实现 |
|---|---|
| 业务幂等 | 服务端按 `uid + 日期` 唯一，重复直接返回已签到 |
| 限流 | 同一 uid 每分钟最多 N 次 |
| 签名 + nonce | 客户端带 timestamp/nonce，服务端校验并记录 nonce |

**第三步**：再攻击一次，证明防住了。

---

## 5.5 接口签名（选做但推荐）

<!-- _class: smalltext -->

```js
// utils/sign.js
import CryptoJS from 'crypto-js'

// TODO-27: 实现签名
//   raw = 参数按 key 升序拼接 + &_ts= + &_nonce=
//   sign = HMAC-SHA256(raw, SIGN_KEY)
export function sign(params, secret) { }
```

```js
// 挂到请求拦截器
http.interceptors.request.use(config => {
  if (config.needSign) { /* 加 X-Timestamp / X-Nonce / X-Sign */ }
  return config
})
```

<br>

**必答**：小程序包可被反编译，`SIGN_KEY` 必然泄漏。
那么签名机制**实际挡住了哪一类攻击**？它**没有**挡住哪一类？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 27 个 TODO 全部补全，前后端可联调 | 15 |
| 2 | `/auth/login` 响应中**不含 session_key**（附截图） | 10 |
| 3 | 双令牌 + rotation 实现正确 | 10 |
| 4 | 无感续期：6 并发只刷新 1 次，界面无感（附双日志截图） | 15 |
| 5 | 登录回跳三个场景全部正确 | 10 |
| 6 | 四种攻击**攻击成功 + 防护成功**双向截图齐全 | 25 |
| 7 | 全部必答问题回答正确 | 15 |

---

## 6.2 安全自查表（必须逐项打勾）

<!-- _class: smalltext -->

- [ ] 代码里搜索 `secret` / `SECRET` / `key`，确认小程序侧无任何真实密钥
- [ ] `.env` 在 `.gitignore` 中，提交物里没有它
- [ ] `session_key` 只在服务端内存/Redis 中，未出现在任何响应里
- [ ] 所有涉及用户数据的接口都用 `req.uid`，不用请求参数里的 uid
- [ ] `isAdmin` 等权限标志来自数据库，不来自请求
- [ ] access token 有过期时间；refresh token 可吊销
- [ ] 登出后服务端 refresh token 被删除（用旧 refresh 调用应 401）
- [ ] `/checkin` 有幂等保护
- [ ] 日志里不打印完整 token 与手机号

---

## 6.3 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| `code been used` | 同一个 code 用了两次 | code 一次性，重新 `wx.login` |
| `invalid code` | code 超过 5 分钟 | 拿到 code 后立即换 |
| 每次 onShow 都要重新登录 | 无脑调 `wx.login` 让 session 失效 | 先 `checkSession` |
| 401 后无限跳登录页 | 重放没打 `_retried` 标记 | 检查 `handle401` |
| 登录后回跳到首页 | 没记 query 或用错跳转 API | tabBar 用 `switchTab` |
| 服务端 CORS 报错 | 小程序不走 CORS，但工具里会 | 检查是否勾选"不校验合法域名" |
| JWT 校验一直失败 | 前后端 secret 不一致 | 核对 `.env` |

---

## 6.4 拓展（选做，加分）

1. 实现**头像昵称填写**（`chooseAvatar` + `type="nickname"`），
   头像上传到服务端并做尺寸压缩；
2. 实现**手机号获取**的完整链路（用 Mock 模拟微信的 `getuserphonenumber` 接口）；
3. 实现**设备指纹**：把 `deviceId + 系统信息` 的哈希绑定到 refresh token，
   换设备时强制重新登录；
4. 给服务端加**审计日志**：记录每次登录、刷新、登出、敏感操作的
   uid / IP / UA / 时间，并写一个查询接口。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验七 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
