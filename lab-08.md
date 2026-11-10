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

# 实验八 分享、订阅消息与小程序码

###### “酒香也怕巷子深。”

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
- 任务一：分享与归因
- 任务二：订阅消息
- 任务三：小程序码与场景值
- 任务四：能力降级
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 实现**转发 + 朋友圈分享**，并做完整的**分享链路归因**；
2. 实现**订阅消息**的请求、余额管理与推送（服务端 Mock）；
3. 用 `getUnlimitedQRCode` 生成小程序码，解决 **scene 32 字符**限制；
4. 为每个开放能力实现**降级路径**，并验证降级生效。

<br>

> 对应 **第八章**。配套代码：`code-08/`

---

## 1.2 关于主体资质

<!-- _class: smalltext -->

本实验涉及的能力对主体要求不同：

| 能力 | 个人主体 | 本实验做法 |
|---|---|---|
| 转发 / 朋友圈分享 | ✓ | **真实实现** |
| 场景值 / 启动参数 | ✓ | **真实实现** |
| 小程序码 | ✓（需 access_token） | 服务端真实调用，无 AppSecret 时走 Mock |
| 订阅消息 | ✓（模板需申请） | 客户端真实请求，服务端推送走 Mock |
| 获取手机号 | ✗ | **仅 Mock**，理解流程 |

<br>

**没有企业主体不影响完成本实验**——
Mock 服务器会返回与真实接口**完全相同结构**的响应。

---

## 1.3 准备

```bash
cd code-08/server && npm install && npm start
cd ../miniprogram && npm install
```

<!-- _class: smalltext -->

| 页面 | 用途 |
|---|---|
| `pages/index/index` | 首页，展示启动参数与场景值 |
| `pages/goods/detail` | 商品详情，分享入口 |
| `pages/order/success` | 下单成功，订阅消息入口 |
| `pages/qrcode/qrcode` | 小程序码生成与解析 |
| `pages/capability/capability` | 任务四：能力探测与降级 |

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：分享与归因

---

## 2.1 转发

<!-- _class: smalltext -->

```js
// pages/goods/detail.js
Component({
  methods: {
    onShareAppMessage(res) {
      // TODO-1: 区分 res.from
      //   'button' → 从 res.target.dataset 取商品信息
      //   'menu'   → 用当前页面的商品
      // TODO-2: path 必须带来源标识：from=share & uid=当前用户 & ts
      // TODO-3: imageUrl 用商品主图（5:4，建议 500x400）
      return { title: '', path: '', imageUrl: '' }
    },

    onShareTimeline() {
      // TODO-4: 注意只有 query 没有 path
      return { title: '', query: '', imageUrl: '' }
    }
  }
})
```

```html
<button open-type="share" data-id="{{goods.id}}" data-title="{{goods.title}}">
  分享给好友
</button>
```

---

## 2.2 归因解析

<!-- _class: smalltext -->

```js
// utils/attribution.js

// TODO-5: 解析启动参数，产出统一的来源对象
//   { channel, inviterId, goodsId, scene, isSinglePage }
export function parseEntry() {
  const opts = wx.getLaunchOptionsSync()
  // scene 值参考第八章表格
  // mode === 'singlePage' 表示朋友圈单页模式
}

// TODO-6: 把来源写入一次性的会话上下文，供本次会话内的埋点使用
export function setEntryContext(entry) { }
```

```js
// app.js
onLaunch(options) {
  const entry = parseEntry()
  setEntryContext(entry)
  report('app_launch', entry)
}
```

---

## 2.3 单页模式适配

<!-- _class: smalltext -->

朋友圈分享打开的是**单页模式**：没有页面栈、底部有"前往小程序"入口。

```js
// TODO-7: 检测并调整交互
onLoad() {
  const { mode } = wx.getLaunchOptionsSync()
  if (mode === 'singlePage') {
    this.setData({
      singlePage: true,
      // 单页模式下不能 navigateTo 到需要页面栈的流程
      hideBuyButton: true
    })
  }
}
```

<br>

**必做实验**（需真机）：

1. 从朋友圈打开分享的商品页；
2. 点击"立即购买"，观察发生了什么；
3. 记录 `getCurrentPages().length` 的值；
4. 设计一个合理的单页模式交互（例如引导"前往小程序查看更多"）。

---

## 2.4 归因数据验证

<!-- _class: smalltext -->

在真机上完成下列链路，记录每一步的 `scene` 与 `query`：

| # | 操作 | scene | query 里有什么 |
|---|---|---|---|
| 1 | 从"发现"栏打开 | | |
| 2 | A 分享给 B，B 点开 | | |
| 3 | A 分享到群，群里 C 点开 | | |
| 4 | 分享到朋友圈后点开 | | |
| 5 | 扫小程序码打开 | | |

<br>

**必答**：第 2、3 行的 `scene` 分别是多少？
如果要统计"哪些用户是被 A 拉来的"，你需要哪些字段？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：订阅消息

---

## 3.1 客户端请求订阅

<!-- _class: smalltext -->

```js
// pages/order/success.js
const TMPL = {
  PAID: 'tmpl_paid_xxx',
  SHIPPED: 'tmpl_shipped_xxx',
  ARRIVED: 'tmpl_arrived_xxx'
}

methods: {
  async onSubscribe() {
    // TODO-8: 请求订阅，最多 3 个模板
    // TODO-9: 解析结果，只把 'accept' 的告知服务端
    // TODO-10: 用户勾了「总是保持以上选择」并拒绝时，
    //          wx.requestSubscribeMessage 会直接 fail —— 走引导设置流程
  },

  // TODO-11: 检查订阅设置，被永久拒绝时引导 openSetting
  async checkSubscription() {
    const setting = await wx.getSetting({ withSubscriptions: true })
    // setting.subscriptionsSetting.itemSettings[tmplId] === 'reject'
  }
}
```

---

## 3.2 请求时机的设计

<!-- _class: smalltext -->

**不要**在首页一进来就弹订阅。请在 `pages/order/success` 里实现：

```html
<view class="tip">开启通知，第一时间知道发货进度</view>
<button bindtap="onSubscribe">开启发货通知</button>
```

<br>

**对照实验**（可用同学互测，至少 5 人）：

| 时机 | 请求次数 | accept 次数 | 通过率 |
|---|---|---|---|
| 首页启动时弹 | | | |
| 下单成功页，有文案说明 | | | |

**必答**：为什么时机会显著影响通过率？
在你的设计里，还有哪些场景适合请求订阅？

---

## 3.3 服务端余额管理

<!-- _class: smalltext -->

```js
// server/subscribe.js

// TODO-12: 记录订阅 —— accept 一次余额 +1（可累积）
app.post('/subscribe', auth, (req, res) => {
  const { tmplIds } = req.body
  // store: Map<`${uid}:${tmplId}`, count>
})

// TODO-13: 推送 —— 先检查余额，推送成功后 -1
async function push(uid, tmplId, data) {
  // 1. 余额 <= 0 → { skipped: true, reason: 'no_quota' }
  // 2. 调 subscribeSend（MOCK 模式下直接返回 { errcode: 0 }）
  // 3. errcode === 0 → 余额 -1
  // 4. errcode === 43101 → 余额清零（用户已拒收）
}

// TODO-14: 模拟发货 —— 触发一次推送
app.post('/debug/ship', auth, async (req, res) => { })
```

---

## 3.4 模板字段格式校验

<!-- _class: smalltext -->

订阅消息的字段有严格格式，**格式错误会返回 47003**。

```js
// server/tmpl-validate.js
// TODO-15: 实现校验器
const RULES = {
  thing:            v => /^[\s\S]{1,20}$/.test(v),          // 20 汉字以内
  character_string: v => /^[A-Za-z0-9\-_.]{1,32}$/.test(v),
  amount:           v => /^[¥￥$]?\d{1,10}(\.\d{1,2})?$/.test(v),
  time:             v => /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(v),
  phrase:           v => /^[一-龥]{1,5}$/.test(v),  // 5 个汉字以内
  number:           v => /^\d+(\.\d+)?$/.test(v)
}

function validate(data) {
  // 字段名形如 thing2 / amount3 —— 取出类型前缀后校验
}
```

**验证**：故意传一个 6 个汉字的 `phrase`，确认被拦下并给出清晰错误信息。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：小程序码与场景值

---

## 4.1 服务端生成

<!-- _class: smalltext -->

```js
// server/qrcode.js

// TODO-16: 短 key 映射（解决 scene 只有 32 字符的限制）
//   1. 把完整参数存起来，生成 8 位短 key
//   2. 用短 key 作为 scene 调 getUnlimitedQRCode
//   3. 返回图片（Buffer → base64 或存文件返回 URL）
app.post('/qrcode', auth, async (req, res) => {
  const { page, params } = req.body       // params 可能很长
  const key = nanoid(8)
  // store.scene.set(key, { params, expireAt })
})

// TODO-17: 换回完整参数
app.get('/scene/:key', (req, res) => { })
```

<br>

**MOCK 模式**：不调微信接口，用 `qrcode` npm 包生成一张
内容为 `mock://scene=<key>&page=<page>` 的普通二维码，
便于本地扫码测试链路。

---

## 4.2 客户端解析

<!-- _class: smalltext -->

```js
// pages/goods/detail.js
async onLoad(query) {
  // TODO-18: scene 是 URL 编码过的，必须 decodeURIComponent
  if (query.scene) {
    const key = decodeURIComponent(query.scene)
    const params = await http.get('/scene/' + key)
    this.applyParams(params)
    report('qrcode_open', { key, ...params })
  } else {
    this.applyParams(query)
  }
}
```

<br>

**必做实验**：

1. 构造一个**超过 32 字符**的参数串（如带签名的推广参数）；
2. 直接把它当 `scene` 传给接口，记录返回的**错误信息原文**；
3. 改用短 key，验证成功；
4. 报告里对比两种方式。

---

## 4.3 三种码的对比

在 `pages/qrcode/qrcode` 上提供三个按钮，分别生成三种码并记录：

<!-- _class: smalltext -->

| 接口 | 数量限制 | 参数长度 | 生成耗时 | 是否支持未发布页面 |
|---|---|---|---|---|
| `getQRCode` | | | | |
| `getUnlimitedQRCode` | | | | |
| `createQRCode` | | | | |

<br>

**必答**：

1. `check_path: false` 的作用是什么？什么时候必须用它？
2. `env_version` 有哪三个值？开发阶段该用哪个？
3. 生产环境为什么必须 `check_path: true`？

---

## 4.4 场景值分流

<!-- _class: smalltext -->

```js
// pages/index/index.js
// TODO-19: 按场景值做差异化首屏
onLoad() {
  const { scene, query } = wx.getLaunchOptionsSync()
  const strategy = {
    1011: 'scan',        // 扫描二维码
    1047: 'scan',        // 扫描小程序码
    1007: 'share',       // 单聊
    1008: 'share',       // 群聊
    1044: 'group',       // 带 shareTicket 的群分享
    1089: 'recent'       // 下拉最近使用
  }[scene] || 'default'

  this.setData({ strategy })
  // scan   → 直接跳到扫码对应的商品/门店
  // share  → 高亮分享来源，展示"XX 推荐给你"
  // group  → 展示群拼团入口
  // default→ 正常首页
}
```

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：能力降级

---

## 5.1 统一降级封装

<!-- _class: smalltext -->

```js
// utils/capability.js

// TODO-20: 实现 withFallback
//   1. canIUse 不支持 → 直接走 fallback
//   2. primary 抛错 → 记录原因后走 fallback
//   3. 两者都失败 → 抛出，由调用方处理
export async function withFallback(name, primary, fallback) { }

// TODO-21: 记录降级事件，便于统计各能力的可用率
function reportDegrade(name, reason) { }
```

<br>

```js
// 用法
const phone = await withFallback(
  'button.open-type.getPhoneNumber',
  () => getPhoneByWx(),
  () => showManualPhoneInput()
)
```

---

## 5.2 必须实现降级的四个能力

<!-- _class: smalltext -->

| 能力 | 失败原因 | 降级方案 |
|---|---|---|
| **获取手机号** | 个人主体 / 用户拒绝 | 手动输入 + 短信验证码（Mock） |
| **订阅消息** | 用户拒绝 / 模板被封 | 站内消息中心 + 小红点 |
| **小程序码** | access_token 失败 / 配额用尽 | 展示可复制的**分享链接** |
| **`getLocation`** | 未申请接口 / 用户拒绝 | 手动选择城市 + `chooseLocation` |

<br>

**每一项都要在 `pages/capability/capability` 里提供**
"强制失败"开关，用来演示降级路径。

---

## 5.3 降级验证表

<!-- _class: smalltext -->

对每个能力，记录三种状态下的表现：

| 能力 | 正常 | 用户拒绝 | 接口不可用 |
|---|---|---|---|
| 手机号 | | | |
| 订阅消息 | | | |
| 小程序码 | | | |
| 定位 | | | |

<br>

**验收要求**：

- 三种状态下**都不能出现白屏、卡死或没有任何提示**；
- 降级后的功能**必须真的可用**，不能只是弹个 toast 就结束；
- 每次降级都要有 `reportDegrade` 记录。

---

## 5.4 授权状态管理

<!-- _class: smalltext -->

```js
// TODO-22: 实现通用的授权申请
export async function ensureScope(scope, { title, content }) {
  const setting = await wx.getSetting()
  if (setting.authSetting[scope]) return true

  try {
    await wx.authorize({ scope })
    return true
  } catch (e) {
    // 用户之前拒绝过 → authorize 直接 fail，不会再弹窗
    const { confirm } = await wx.showModal({ title, content, confirmText: '去设置' })
    if (!confirm) return false
    const res = await wx.openSetting()      // ⚠ 只能由用户点击触发
    return !!res.authSetting[scope]
  }
}
```

<br>

**必答**：为什么用户拒绝一次后 `wx.authorize` 不再弹窗？
`wx.openSetting` 为什么必须由用户点击触发？这两个限制是为了防什么？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 22 个 TODO 全部补全 | 15 |
| 2 | 转发 + 朋友圈分享可用，单页模式已适配 | 15 |
| 3 | 归因表 5 行完整（真机实测的 scene 与 query） | 15 |
| 4 | 订阅消息全链路可跑通，含余额管理与格式校验 | 15 |
| 5 | 订阅时机对照实验（≥5 人样本）+ 分析 | 10 |
| 6 | 短 key 方案实现，含超长 scene 的失败截图 | 10 |
| 7 | 四个能力的降级验证表完整，降级功能真实可用 | 15 |
| 8 | 全部必答问题回答正确 | 5 |

---

## 6.2 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 右上角没有转发选项 | 没写 `onShareAppMessage` | 补上 |
| 分享图片不显示 | 比例不是 5:4 或用了本地路径 | 用网络图，5:4 |
| 朋友圈分享菜单没有 | 没写 `onShareTimeline` 或页面不支持 | 补上并真机验证 |
| `requestSubscribeMessage` 直接 fail | 用户勾了"总是保持"并拒绝 | 走 `openSetting` |
| 47003 | 模板字段格式不符 | 用校验器逐字段检查 |
| `scene` 解析出乱码 | 忘了 `decodeURIComponent` | 补上 |
| 小程序码接口 41030 | `page` 不存在或未发布 | 开发期用 `check_path: false` |
| `openSetting` 无反应 | 不是由用户点击触发 | 必须绑在 button 的 tap 上 |

---

## 6.3 拓展（选做，加分）

1. 实现**群分享 + shareTicket**：拿到 `openGId` 后做"同群拼团"，
   服务端解密 `encryptedData`（Mock 也要走完整解密流程并校验 `watermark.appid`）；
2. 用 **Canvas** 生成带商品图 + 小程序码的**分享海报**（与实验十衔接）；
3. 实现一个**分享裂变统计看板**：
   记录每个用户的分享次数、被点开次数、转化次数，画出漏斗；
4. 实现 **URL Scheme**：生成一个可放进短信的链接，
   在系统浏览器里点开能唤起你的小程序并落到指定页面。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验八 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
