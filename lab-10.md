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

# 实验十 Canvas 海报与 WebView 互通

###### “各尽其能，各得其所。”

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
- 任务一：Canvas 2D 海报
- 任务二：原生组件与同层渲染
- 任务三：web-view 互通
- 任务四：跨端选型分析
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 用 **Canvas 2D** 生成分享海报，处理 DPR、字体换行、网络图、保存相册；
2. 验证**同层渲染**的能力与残留限制，实现**单例 video** 的列表方案；
3. 打通 **web-view ↔ 小程序**的双向通信与登录态传递；
4. 基于实测数据完成一次**跨端技术选型**分析。

<br>

> 对应 **第十章**。配套代码：`code-10/`

---

## 1.2 准备

```bash
cd code-10
npm install
cd h5 && npm install && npm start     # H5 页面，http://localhost:5173
```

<!-- _class: smalltext -->

| 页面 | 用途 |
|---|---|
| `pages/poster/poster` | 任务一：海报生成 |
| `pages/native/native` | 任务二：原生组件实验 |
| `pages/feed/feed` | 任务二：单例 video 列表 |
| `pages/webview/webview` | 任务三：web-view 容器 |
| `h5/` | 任务三：配套 H5 页面 |

**注意**：`web-view` 需要**业务域名**且**个人主体不可用**。
本实验提供本地 H5 + 工具"不校验合法域名"的方案，可完整走通流程。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：Canvas 2D 海报

---

## 2.1 获取 context

<!-- _class: smalltext -->

```js
// utils/canvas.js

// TODO-1: 拿到 canvas 与 ctx，并按 DPR 缩放
export async function getCtx(comp, selector) {
  const [res] = await new Promise(r =>
    comp.createSelectorQuery().select(selector)
        .fields({ node: true, size: true }).exec(r)
  )
  const canvas = res.node
  const ctx = canvas.getContext('2d')
  const dpr = wx.getWindowInfo().pixelRatio
  // 关键三行：不做这个，海报在高分屏上是糊的
  canvas.width = res.width * dpr
  canvas.height = res.height * dpr
  ctx.scale(dpr, dpr)
  return { canvas, ctx, width: res.width, height: res.height }
}
```

<br>

**对照实验**：注释掉 `canvas.width = res.width * dpr` 这三行，
在 DPR=3 的手机上生成海报，**截图对比清晰度**。

---

## 2.2 图片加载

```js
// TODO-2: 加载图片（本地路径与网络 URL 都要支持）
export function loadImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败: ' + src))
    img.src = src
  })
}

// TODO-3: 网络图先下载到本地再画（更稳，且能规避部分域名问题）
export async function loadRemote(canvas, url) {
  const { tempFilePath } = await wx.downloadFile({ url })
  return loadImage(canvas, tempFilePath)
}
```

<br>

**必做实验**：直接用网络 URL 画图，
在**未配置 downloadFile 合法域名**时会发生什么？记录错误信息。

---

## 2.3 文字处理

<!-- _class: smalltext -->

```js
// TODO-4: 单行截断
export function ellipsis(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  // 二分查找最长可容纳的前缀，末尾加 '…'
}

// TODO-5: 多行换行（中英文混排）
//   注意：中文可以任意位置断行，英文单词不该被拆开
export function wrapText(ctx, text, maxWidth, maxLines) {
  // 返回 string[]，超出 maxLines 时最后一行加 '…'
}
```

```js
// 使用
const lines = wrapText(ctx, goods.title, W - 40, 2)
lines.forEach((line, i) => ctx.fillText(line, 20, 240 + i * 24))
```

<br>

**测试用例**：分别用纯中文、纯英文、中英混排、含 emoji 的标题测试。

---

## 2.4 完整海报

<!-- _class: smalltext -->

```js
// TODO-6: 绘制海报
export async function drawPoster(comp, { cover, title, priceInCent, qrcode, nickname }) {
  const { canvas, ctx, width: W, height: H } = await getCtx(comp, '#poster')

  // 1. 白底
  // 2. 商品主图（顶部，aspectFill 效果需要自己算裁剪区域）
  // 3. 标题（最多两行，超出省略）
  // 4. 价格（红色，大字号）
  // 5. 分享者昵称 + 头像（圆形，需要 clip）
  // 6. 小程序码（右下角）
  // 7. 圆角卡片（用 arcTo 或 roundRect）

  return wx.canvasToTempFilePath({ canvas, destWidth: W * 2, destHeight: H * 2 })
}
```

<br>

**TODO-7**：实现圆形头像

```js
ctx.save()
ctx.beginPath()
ctx.arc(cx, cy, r, 0, Math.PI * 2)
ctx.clip()
ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2)
ctx.restore()          // ⚠ 忘了 restore 会让后续绘制全被裁掉
```

---

## 2.5 保存到相册

<!-- _class: smalltext -->

```js
// TODO-8: 完整的保存流程（含授权与降级）
async function save(tempFilePath) {
  const setting = await wx.getSetting()
  if (!setting.authSetting['scope.writePhotosAlbum']) {
    try {
      await wx.authorize({ scope: 'scope.writePhotosAlbum' })
    } catch (e) {
      const { confirm } = await wx.showModal({
        title: '需要相册权限', content: '保存海报需要访问相册', confirmText: '去设置'
      })
      if (!confirm) return { saved: false, reason: 'declined' }
      const res = await wx.openSetting()
      if (!res.authSetting['scope.writePhotosAlbum']) return { saved: false }
    }
  }
  await wx.saveImageToPhotosAlbum({ filePath: tempFilePath })
  return { saved: true }
}
```

<br>

**降级方案**：拒绝授权时，提供**长按图片保存**的引导
（`<image show-menu-by-longpress>`）。

---

## 2.6 离屏 Canvas 对比

<!-- _class: smalltext -->

```js
// TODO-9: 用离屏 canvas 重新实现一遍
const canvas = wx.createOffscreenCanvas({ type: '2d', width: 600, height: 800 })
```

<br>

对比两种方式：

| | 页面内 canvas | 离屏 canvas |
|---|---|---|
| 需要 WXML 节点 | ✓ | ✗ |
| 能否直接展示 | ✓ | ✗ |
| 生成耗时 | | |
| 是否影响页面渲染 | | |
| 隐藏方式 | 绝对定位移出屏幕 | 不需要 |

**必答**：为什么页面内 canvas **不能**用 `display: none` 隐藏？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：原生组件与同层渲染

---

## 3.1 同层渲染验证

<!-- _class: smalltext -->

`pages/native/native` 页面上放 `video` / `map` / `camera`，
上面盖一个 `position: fixed; z-index: 9999` 的浮层。

**TODO-10**：逐项测试并填表（**必须真机**，iOS + Android 各一份）

| 测试项 | video | map | camera | canvas |
|---|---|---|---|---|
| 普通 view 能否盖住 | | | | |
| `border-radius` 是否生效 | | | | |
| 父级 `overflow: hidden` 是否裁剪 | | | | |
| `transform: rotate` 是否生效 | | | | |
| `filter: blur` 是否生效 | | | | |
| `opacity: 0.5` 是否生效 | | | | |
| 在 `scroll-view` 里滚动是否有拖影 | | | | |

---

## 3.2 单例 video 列表

<!-- _class: smalltext -->

`pages/feed/feed` 是一个 50 条的视频信息流。

**先做对照**：

```js
// TODO-11: 方案 A —— 每项一个 video 组件
```

记录：**内存峰值**、**滚动 FPS**、**首屏时间**。

**再做优化**：

```js
// TODO-12: 方案 B —— 只有一个 video，跟随当前播放项移动
// 1. 列表项默认显示封面图 + 播放按钮
// 2. 点击时用 SelectorQuery 量出该项的位置
// 3. 把唯一的 video 绝对定位到那个位置并播放
// 4. 滚动出可视区时暂停并隐藏
```

<br>

**对比表**：两种方案的内存、FPS、首屏时间各差多少倍？

---

## 3.3 video 的生命周期管理

```js
// TODO-13: 补全
pageLifetimes: {
  hide() { /* 页面隐藏时暂停 */ },
  show() { /* 是否要恢复？想清楚用户预期 */ }
},
methods: {
  onUnload() { /* 释放 videoContext，清理 observer */ }
}
```

<br>

**必做验证**：

1. 播放视频时按 Home 键切后台，声音是否还在响？
2. 切到其他页面，声音是否停了？
3. 如果不停，用户会怎么想？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：web-view 互通

---

## 4.1 H5 侧

<!-- _class: smalltext -->

```html
<!-- h5/index.html -->
<script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
<script>
  // TODO-14: 检测环境
  wx.miniProgram.getEnv(res => {
    document.body.dataset.inMp = res.miniprogram
  })

  // TODO-15: 通知小程序（注意：不是实时的！）
  function notifyMp(type, payload) {
    wx.miniProgram.postMessage({ data: { type, payload, ts: Date.now() } })
  }

  // TODO-16: 跳转小程序页面
  function goDetail(id) {
    wx.miniProgram.navigateTo({ url: '/pages/goods/detail?id=' + id })
  }
</script>
```

---

## 4.2 通信时机实验

<!-- _class: smalltext -->

**这是本任务的核心实验。**

```js
// pages/webview/webview.js
// TODO-17: 记录每次 bindmessage 收到的内容与时间
onMessage(e) {
  console.log('[webview] 收到', e.detail.data.length, '条消息', e.detail.data)
}
```

**操作序列**（每一步都记录小程序端是否收到）：

| # | 操作 | 小程序端收到了吗 |
|---|---|---|
| 1 | H5 里点按钮，`postMessage` 一条 | |
| 2 | 再点两次，共 3 条 | |
| 3 | 点小程序右上角"..."→ 分享 | |
| 4 | 点左上角返回 | |
| 5 | 小程序内 `navigateTo` 离开该页 | |

**必答**：`postMessage` 在什么时机才真正送达？这个设计是为了解决什么问题？

---

## 4.3 登录态传递

<!-- _class: smalltext -->

```js
// 方案 A：URL 直传 token（有安全隐患）
// TODO-18: 实现并说明风险
const url = `${H5_BASE}/order?token=${encodeURIComponent(getToken())}`
```

```js
// 方案 B：一次性 ticket（推荐）
// TODO-19: 实现
// 1. 小程序调 POST /h5/ticket，服务端生成 30 秒有效、一次性的 ticket
// 2. URL 里只带 ticket
// 3. H5 首次加载用 ticket 换自己的会话，ticket 立即作废
const { ticket } = await http.post('/h5/ticket')
const url = `${H5_BASE}/order?ticket=${ticket}`
```

<br>

**必答**：

1. 方案 A 的 token 会出现在哪些地方？（至少列 3 处）
2. 方案 B 里，如果用户 30 秒内没打开页面会怎样？如何优化体验？

---

## 4.4 web-view 的限制验证

<!-- _class: smalltext -->

**TODO-20**：逐项验证并记录

| 限制 | 实验方法 | 结果 |
|---|---|---|
| 一个页面只能有一个 web-view | 放两个看会怎样 | |
| web-view 铺满全屏 | 给它设 `width: 50%` | |
| 任何 view 都盖不住 | 放一个 `z-index: 99999` 的浮层 | |
| 小程序读不到 H5 的 DOM | 试试 `selectComponent` | |
| Cookie 不共享 | H5 里种 Cookie，小程序里能读到吗 | |

<br>

**结论题**：基于以上结果，列出**三个适合**用 `web-view` 的场景
和**三个不适合**的场景，并说明判断依据。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：跨端选型分析

---

## 5.1 动手对比

`code-10/cross/` 提供了同一个页面（商品列表 + 详情）的三份实现：

<!-- _class: smalltext -->

| 实现 | 目录 |
|---|---|
| 原生小程序 | `cross/native/` |
| Taro（运行时） | `cross/taro/` |
| uni-app | `cross/uni/` |

```bash
cd code-10/cross/taro && npm install && npm run build:weapp
cd ../uni && npm install && npm run build:mp-weixin
```

<br>

**TODO-21**：分别导入三个产物，在**同一台真机**上测量：

| 指标 | 原生 | Taro | uni-app |
|---|---|---|---|
| 主包大小 | | | |
| 冷启动耗时 | | | |
| 1000 条列表首屏 | | | |
| 滚动 FPS | | | |
| 内存峰值 | | | |

---

## 5.2 开发体验对比

<!-- _class: smalltext -->

**TODO-22**：在三份实现里各做一次同样的改动
（给列表项加一个"收藏"按钮 + 收藏状态管理），记录：

| 维度 | 原生 | Taro | uni-app |
|---|---|---|---|
| 改动文件数 | | | |
| 耗时 | | | |
| 遇到的坑 | | | |
| 查文档次数 | | | |
| 报错信息是否清晰 | | | |

<br>

**注意**：这个对比**必然带有主观性**，
但请如实记录——包括"因为我更熟悉 React 所以 Taro 更快"这类因素。

---

## 5.3 选型决策

<!-- _class: smalltext -->

基于你的实测数据，为下列三个场景各做一次选型并写出**决策理由**：

**场景 A**：一个校园二手交易小程序，只做微信端，
预计 30 个页面，团队 3 人（都熟悉 Vue），迭代周期 2 周一次。

**场景 B**：一个连锁餐饮品牌，需要微信小程序 + 支付宝小程序 + H5 点餐页，
核心是点单与支付，UI 完全一致，团队 6 人。

**场景 C**：一个已有 iOS/Android App 的产品，
现在要补一个微信小程序做拉新，功能是 App 的 30% 子集。

<br>

**要求**：每个场景说明**选什么、为什么、放弃了什么、风险是什么**。

---

## 5.4 混合策略设计

<!-- _class: smalltext -->

假设你选了"核心原生 + 边缘跨端"的混合方案，请回答：

1. 用什么标准划分"核心"与"边缘"？给出可操作的判据（至少 3 条）；
2. 两套代码如何共享**业务逻辑**（如价格计算、表单校验）？
3. 两套代码如何共享**设计规范**（颜色、间距、组件样式）？
4. 用户从原生页跳到 Taro 页时，**登录态**和**购物车状态**怎么同步？
5. 这套架构的**长期维护成本**在哪里？两年后最可能出什么问题？

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
| 2 | 海报功能完整（DPR、换行、圆形头像、保存、降级），含 DPR 对照截图 | 20 |
| 3 | 同层渲染验证表完整（iOS + Android 双端） | 15 |
| 4 | 单例 video 实现正确，对比数据完整 | 15 |
| 5 | `postMessage` 时机实验 5 步记录完整，结论正确 | 10 |
| 6 | 一次性 ticket 实现，两个必答问题正确 | 10 |
| 7 | 跨端三项实测数据 + 三个场景选型分析 | 15 |

---

## 6.2 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 海报模糊 | 没按 DPR 放大 | `canvas.width = w * dpr` |
| 海报是空白 | canvas 用了 `display: none` | 绝对定位移到屏幕外 |
| 网络图画不出来 | 域名未配 downloadFile 白名单 | 配置或先 `downloadFile` |
| `ctx.clip` 后面全没了 | 忘了 `restore` | `save` / `restore` 成对 |
| 保存相册无反应 | 未授权且没处理 fail | 走 `openSetting` |
| web-view 白屏 | 域名未配业务域名/校验文件 | 工具里勾"不校验合法域名" |
| `postMessage` 收不到 | 时机没到 | 触发分享或返回再看 |
| 视频切后台还有声音 | 没在 `pageLifetimes.hide` 暂停 | 补上 |
| Taro 构建产物跑不起来 | 基础库版本或 node 版本 | 看 Taro 的版本矩阵 |

---

## 6.3 拓展（选做，加分）

1. 海报支持**模板化**：用一份 JSON 描述布局（元素类型、位置、样式），
   写一个通用渲染器，换海报样式不用改代码；
2. 实现**海报缓存**：同样参数的海报只生成一次，存 `USER_DATA_PATH`；
3. 用 `wx.createOffscreenCanvas` + **Worker** 生成海报，
   验证是否能避免阻塞逻辑层；
4. 实现 web-view 的**实时通信**：用 WebSocket 中转，
   H5 与小程序都连同一个房间，对比与 `postMessage` 的延迟差异。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验十 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
