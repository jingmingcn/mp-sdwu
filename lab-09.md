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

# 实验九 性能优化实战

###### “测之而后知，量之而后行。”

张丽，井明
数据科学与计算机学院
jingming@sdu.edu.cn
2026年秋

---

<!-- _header: 目录<br>CONTENTS<br>![](images/logo-1_transparent.png)-->
<!-- _class: toc_b -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

- 实验目标与基线
- 任务一：启动优化
- 任务二：分包与预加载
- 任务三：虚拟列表
- 任务四：感知性能
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与基线

---

## 1.1 实验目标

本实验给你一个**故意写得很差**的工程 `code-09/`，
你的任务是把它优化到达标，并且**每一步都有 before/after 数据**。

<br>

1. 建立性能基线与度量方法；
2. 主包瘦身 + 启动链路优化；
3. 分包 + `preloadRule` + 独立分包；
4. 虚拟列表 + 图片优化；
5. 骨架屏 + SWR + 乐观更新。

> 对应 **第九章**。配套代码：`code-09/`

---

## 1.2 初始工程的问题（已知）

<!-- _class: smalltext -->

`code-09/` 里**故意埋了**这些问题，请逐一找出并修复：

| # | 问题 | 位置 |
|---|---|---|
| 1 | 12 张约 100KB 的图片放在代码包里（合计 1.2MB） | `images/` |
| 2 | `app.js` 顶层 `require` 了 360KB 的城市 JSON | `app.js` |
| 3 | `onLaunch` 里串行 `await` 四个初始化 | `app.js` |
| 4 | 全量引入 `lodash` 和 `moment` | `utils/` |
| 5 | 没有分包，页面全在主包 | `app.json` |
| 6 | 首页一次 `setData` 传 2000 条含冗余字段的数据 | `pages/index` |
| 7 | 滚动时每帧 `setData` | `pages/index` |
| 8 | 图片没有尺寸参数、没有 `lazy-load` | `pages/index` |
| 9 | 详情页跳转前 `await` 接口 | `pages/index` |
| 10 | 没有骨架屏、没有缓存 | 全局 |

---

## 1.3 建立基线（必须先做）

<!-- _class: smalltext -->

**在动任何代码之前**，记录下列基线数据：

| 指标 | 测量方法 | 基线值 |
|---|---|---|
| 主包大小 | 详情 → 基本信息 | |
| 总包大小 | 同上 | |
| 冷启动耗时 | 真机，`onLaunch` → 首页 `onReady` | |
| 首屏时间 | 真机，到列表第一屏可见 | |
| 首次 setData 字节数 | 劫持 `setData` 统计 | |
| 首屏 setData 往返耗时 | `setData` 回调计时 | |
| 列表滚动 FPS（最低） | 真机性能面板 | |
| 内存峰值 | 真机性能面板 | |

<br>

**要求**：**同一台真机**、**同一网络**、**冷启动 3 次取中位数**。

---

## 1.4 度量工具

```js
// utils/perf.js（已提供）
export const mark = name => marks.set(name, Date.now())
export const measure = (name, from) => { /* ... */ }

// utils/setdata-monitor.js（已提供）
// 在页面 attached 时调用，劫持 setData 统计次数与字节数
export function monitorSetData(ctx, label) { }
```

<br>

```js
// 每次优化后运行，输出对比报告
// TODO-1: 实现 dumpReport()，打印一张 before/after 表格
```

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：启动优化

---

## 2.1 图片治理

<!-- _class: smalltext -->

```text
images/
├── banner-0.png    ~100KB
├── banner-1.png    ~100KB
├── ...             共 12 张，合计约 1.2MB
```

**TODO-2**：把图片移出代码包。三种方案任选（说明你的选择理由）：

| 方案 | 做法 |
|---|---|
| CDN | 上传到任意图床/对象存储，代码里改成 URL |
| 云存储 | 用实验十一的云存储（本实验可先用 Mock URL） |
| base64 内联 | **仅限**极小的图标（< 3KB） |

<br>

**同时要做**：给所有图片 URL 加尺寸参数

```js
// TODO-3: 实现 imgUrl(base, width)
//   按 pixelRatio 算出实际需要的像素宽度，拼上 CDN 裁剪参数与 webp
export function imgUrl(base, width) { }
```

---

## 2.2 依赖瘦身

<!-- _class: smalltext -->

```js
// ✗ 现状
const _ = require('lodash')
const moment = require('moment')

_.get(obj, 'a.b.c')
moment(ts).format('YYYY-MM-DD')
```

**TODO-4**：改造并记录体积变化

| 改造 | 前 | 后 | 减少 |
|---|---|---|---|
| `lodash` → 按需引入 / 手写 | | | |
| `moment` → `dayjs` / 手写 | | | |

<br>

**思考题**：本项目只用到了 `_.get` 和一个日期格式化。
自己写这两个函数需要多少行？相比引入库，
**收益**（体积）和**代价**（维护、边界处理）如何权衡？

---

## 2.3 app.js 改造

<!-- _class: smalltext -->

```js
// ✗ 现状
const cities = require('./config/all-cities.js')   // 360KB，注入时就执行
const dayjs = require('dayjs')

App({
  async onLaunch() {
    await this.checkUpdate()      // 300ms
    await this.initTracker()      // 200ms
    await this.login()            // 400ms
    await this.fetchConfig()      // 250ms
  }
})
```

```js
// TODO-5: 改造要求
// 1. 城市数据改成懒加载（用到时才 require，或改成接口）
// 2. 首屏必需的（login / fetchConfig）并行，挂 Promise 供页面 await
// 3. 非必需的（checkUpdate / initTracker）推到 wx.nextTick
// 4. 记录改造前后的 onLaunch 耗时
```

---

## 2.4 首屏请求前置

```js
// TODO-6: 在 app.js 的 onLaunch 里根据启动路径提前发起首页请求
App({
  onLaunch(options) {
    if (options.path === 'pages/index/index') {
      this.prefetch = http.get('/feed', { page: 1 })
    }
  }
})
```

```js
// TODO-7: 首页优先使用预请求结果
async onLoad() {
  const data = await (getApp().prefetch || http.get('/feed', { page: 1 }))
}
```

<br>

**测量**：预请求带来的收益是多少毫秒？
在**弱网**（工具里可模拟 3G）下收益是否更明显？

---

## 2.5 lazyCodeLoading

```json
// app.json
{ "lazyCodeLoading": "requiredComponents" }
```

<br>

**TODO-8**：开启前后各测 3 次冷启动，填表：

| | 启动耗时（中位数） | 差值 |
|---|---|---|
| 关闭 | | — |
| 开启 | | |

<br>

**注意**：本项目全局注册了 8 个组件，
开启后首页只会注入它实际用到的 3 个。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：分包与预加载

---

## 3.1 分包规划

<!-- _class: smalltext -->

请自己规划分包并**说明理由**（工程里已给出四个分包目录的骨架）：

```json
// TODO-9: 填写你的分包方案
{
  "pages": [ /* 主包：只放 tabBar 页与启动必需 */ ],
  "subpackages": [
    { "root": "packageGoods", "name": "goods", "pages": [] },
    { "root": "packageUser",  "name": "user",  "pages": [] },
    { "root": "packageActivity", "name": "activity", "pages": [], "independent": true }
  ],
  "preloadRule": { }
}
```

<br>

**约束**：

- 主包必须 < 1.2MB；
- `packageActivity` 必须是**独立分包**（模拟广告落地页）；
- `preloadRule` 要有依据，不能全部预下载（有 2MB 限制）。

---

## 3.2 独立分包的挑战

独立分包**不能引用主包代码**，且 `getApp()` 返回 `undefined`。

<!-- _class: smalltext -->

```js
// packageActivity/landing/landing.js
// TODO-10: 让落地页在独立分包下也能工作
// 1. getApp({ allowDefault: true }) 的行为是什么？
// 2. 登录态怎么办？（提示：可以自己调 wx.login，或延后到用户点击时）
// 3. request 封装要复制一份吗？体积多大？有没有更好的办法？
```

<br>

**必做实验**：

| 场景 | 启动耗时 |
|---|---|
| 落地页在**普通分包**里，扫码直达 | |
| 落地页在**独立分包**里，扫码直达 | |

**必答**：独立分包省了什么时间？代价是什么？

---

## 3.3 分包异步化

<!-- _class: smalltext -->

首页有一个"数据看板"组件，依赖了一个 300KB 的图表库。

```json
// TODO-11: 把它放进分包，用 componentPlaceholder 做占位
// pages/index/index.json
{
  "usingComponents": {
    "dashboard": "../../packageChart/components/dashboard/index"
  },
  "componentPlaceholder": { "dashboard": "view" }
}
```

<br>

**验证**：

1. 首页加载时，看板区域先显示占位（骨架），分包下载完后替换；
2. 主包体积减少了多少？
3. 首屏时间变化了多少？
4. 在**弱网**下，占位状态会持续多久？用户体验可以接受吗？

---

## 3.4 preloadRule 命中率

<!-- _class: smalltext -->

```json
"preloadRule": {
  "pages/index/index": { "network": "all", "packages": ["goods"] }
}
```

**TODO-12**：埋点统计预下载的命中率

```js
// 记录：用户从首页出发，下一个访问的页面属于哪个分包
report('nav', { from: 'index', toPackage: 'goods' })
```

<br>

| 预下载的包 | 后续访问次数 | 命中率 |
|---|---|---|
| goods | | |
| user | | |

**必答**：命中率低于多少时，预下载是"净亏损"？
（提示：考虑流量成本与对首屏的干扰）

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：虚拟列表

---

## 4.1 三级优化

按顺序实施，**每一级都要测数据**：

<!-- _class: smalltext -->

| 级别 | 做法 | setData 字节 | 首屏耗时 | 滚动 FPS |
|---|---|---|---|---|
| L0 基线 | 2000 条全量 + 冗余字段 | | | |
| L1 字段裁剪 | 只传渲染用的 4 个字段 | | | |
| L2 分页 + 增量 | 每页 20 条，数据路径追加 | | | |
| L3 虚拟列表 | 只渲染可视区 + buffer | | | |

<br>

**TODO-13 ~ TODO-15**：分别实现 L1 / L2 / L3。

**注意**：L2 的增量追加要用数据路径，
不能 `this.setData({ list: [...old, ...new] })`。

---

## 4.2 虚拟列表组件

<!-- _class: tinytext -->

```js
// components/virtual-list/index.js
Component({
  properties: {
    items: { type: Array, value: [] },
    itemHeight: { type: Number, value: 200 },   // rpx
    buffer: { type: Number, value: 3 }
  },
  data: { visible: [], padTop: 0, padBottom: 0 },
  methods: {
    // TODO-16: rpx → px
    pxItem() { },

    // TODO-17: 根据 scrollTop 计算可视窗口
    //   start = max(0, floor(scrollTop / h) - buffer)
    //   count = ceil(viewportH / h) + buffer * 2
    //   visible 里每项要带原始下标 _i 作为 wx:key
    update(scrollTop) { },

    // TODO-18: 滚动节流 —— 位移不足半个 item 不重算
    onScroll(e) { },

    // TODO-19: 对外提供 scrollToIndex(n)
    scrollToIndex(n) { }
  }
})
```

<br>

**验收**：2000 条数据下，**节点数必须 < 100**（用 `selectAll('*')` 统计）。

---

## 4.3 白屏问题

快速滑动时虚拟列表会白屏。请实验三种缓解手段并对比：

<!-- _class: smalltext -->

| 手段 | 实现 | 白屏时长 | 代价 |
|---|---|---|---|
| 增大 buffer（3 → 10） | 改属性 | | 节点数增加 |
| 骨架占位 | 未渲染区域显示灰块 | | 实现复杂度 |
| 降低滚动节流阈值 | 从半个 item 改成 1/4 | | setData 次数增加 |

<br>

**必答**：三者能同时用吗？你最终选择了哪个组合？为什么？

---

## 4.4 图片优化

<!-- _class: smalltext -->

```html
<!-- TODO-20: 优化列表中的图片 -->
<image src="{{item.cover}}"
       mode="aspectFill"
       lazy-load
       webp
       style="width:200rpx;height:200rpx"       
       binderror="onImgError" />
```

<br>

| 优化项 | 说明 | 收益 |
|---|---|---|
| 固定宽高 | 避免加载后重排 | |
| `lazy-load` | 只加载可视区 | 首屏请求数 |
| CDN 裁剪 + webp | 按实际显示尺寸请求 | 下载量 |
| 占位色/图 | 避免闪白 | 感知 |
| `binderror` 兜底 | 图裂时显示默认图 | 稳定性 |

**测量**：首屏图片总下载量优化前后各是多少 KB？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：感知性能

---

## 5.1 骨架屏

```html
<!-- TODO-21: 实现骨架屏 -->
<block wx:if="{{loading}}">
  <view class="skeleton">
    <view class="sk-item" wx:for="{{[1,2,3,4,5]}}" wx:key="*this">
      <view class="sk-img"></view>
      <view class="sk-line w80"></view>
      <view class="sk-line w50"></view>
    </view>
  </view>
</block>
<block wx:else>
  <virtual-list items="{{list}}" />
</block>
```

<br>

**提示**：开发者工具支持**自动生成骨架屏**（右键页面 → 生成骨架屏），
可以生成后再手工精简。

**要求**：骨架屏的**布局必须与真实内容一致**，否则切换时会跳动。

---

## 5.2 SWR 缓存

```js
// TODO-22: 首页数据接入 SWR
async onLoad() {
  const data = await swr('home:feed', () => http.get('/feed'), {
    ttl: 5 * 60_000,
    onUpdate: fresh => {
      // 只在数据确实变化时更新，且要保持滚动位置
    }
  })
  this.setData({ list: data, loading: false })
}
```

<br>

**测量**：

| 场景 | 首屏时间 |
|---|---|
| 首次进入（无缓存） | |
| 二次进入（有缓存） | |
| 二次进入 + 断网 | |

---

## 5.3 跳转不阻塞

<!-- _class: smalltext -->

```js
// ✗ 现状：点击后要等接口才跳
async goDetail(e) {
  const goods = await http.get('/goods/' + e.currentTarget.dataset.id)
  wx.navigateTo({ url: `/packageGoods/detail/detail?id=${goods.id}` })
}
```

```js
// TODO-23: 立即跳转，并把列表页已有的简要数据传过去
goDetail(e) {
  const item = this.data.list.find(x => x.id === e.currentTarget.dataset.id)
  getApp().briefCache = { ...(getApp().briefCache || {}), [item.id]: item }
  wx.navigateTo({ url: `/packageGoods/detail/detail?id=${item.id}` })
}
```

```js
// TODO-24: 详情页先用简要数据渲染，再补全
onLoad({ id }) {
  const brief = getApp().briefCache?.[id]
  if (brief) this.setData({ goods: brief, partial: true })
  this.loadFull(id)
}
```

**测量**：详情页的"感知首屏"时间从多少降到多少？

---

## 5.4 乐观更新

<!-- _class: smalltext -->

```js
// TODO-25: 点赞的乐观更新 + 回滚 + 并发保护
async toggleLike(e) {
  const id = e.currentTarget.dataset.id
  // 1. 若该 id 已有在途请求，直接忽略本次点击（或取消上一次）
  // 2. 立即改 UI
  // 3. 请求失败则回滚，并 toast
  // 4. 注意：回滚时列表可能已经变了，要按 id 找而不是按下标
}
```

<br>

**验证**：

1. 正常网络下点击，UI 是否**立即**响应？
2. 断网点击，UI 先变再回滚，提示是否清晰？
3. **快速连点 5 次**，最终状态是否正确？请求发了几次？

---

## 5.5 最终对比报告

<!-- _class: smalltext -->

| 指标 | 基线 | 优化后 | 提升 | 目标 |
|---|---|---|---|---|
| 主包大小 | | | | < 1.2MB |
| 总包大小 | | | | < 4MB |
| 冷启动耗时 | | | | < 2s |
| 首屏时间 | | | | < 1.5s |
| 二次进入首屏 | | | | < 300ms |
| 首屏 setData 字节 | | | | < 64KB |
| 列表节点数 | | | | < 200 |
| 滚动 FPS（最低） | | | | > 50 |
| 内存峰值 | | | | < 200MB |

**必须同时给出**：每一项优化的**单独收益**（按性价比排序）。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 基线数据完整（8 项，3 次取中位数） | 10 |
| 2 | 25 个 TODO 全部补全，工程可运行 | 15 |
| 3 | 启动优化：图片、依赖、onLaunch、预请求、lazyCodeLoading 各有数据 | 20 |
| 4 | 分包方案合理并说明理由；独立分包对比数据完整 | 15 |
| 5 | 虚拟列表实现正确（2000 条节点数 < 100） | 15 |
| 6 | 感知性能四项（骨架/SWR/跳转/乐观更新）均已实现并验证 | 15 |
| 7 | 最终对比表全部达标，且按性价比排序了各项收益 | 10 |

**任一目标未达标要说明原因与你尝试过的方案。**

---

## 6.2 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 分包后页面找不到 | 路径没跟着改 | 全局搜索旧路径 |
| 主包引用了分包的组件 | 主包不能引分包 | 组件下沉或放主包 |
| 独立分包里 `getApp()` 报错 | 独立分包不执行 App | `getApp({ allowDefault: true })` |
| 虚拟列表滚动条乱跳 | 占位高度算错 | 核对 padTop/padBottom |
| 虚拟列表 wx:key 重复 | 用了 `index` | 用原始下标 `_i` |
| 骨架屏切换时页面跳动 | 骨架布局与真实内容不一致 | 对齐尺寸 |
| 乐观更新连点后状态错乱 | 没做并发保护 | 记录在途请求 |
| 优化后反而变慢 | 预下载抢了首屏带宽 | 调整 `network` 为 wifi |

---

## 6.3 拓展（选做，加分）

1. 实现**不定高**虚拟列表：先渲染测量、缓存高度、支持动态修正；
2. 接入 `wx.getPerformance()` 的 `PerformanceObserver`，
   把 `loadPackage` / `firstRender` / `script` 的数据上报并画成图表；
3. 用 **Skyline** 重写首页（`grid-view` + `sticky-section`），
   与 WebView 版本做完整对比（FPS、内存、启动）；
4. 写一个**构建期检查脚本**：主包超过阈值就让 CI 失败（与实验十二衔接）。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验九 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
