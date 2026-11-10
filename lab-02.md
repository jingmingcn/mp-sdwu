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

# 实验二 WXS 与渲染性能实战

###### “差之毫厘，谬以千里。”

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
- 任务一：WXS 格式化
- 任务二：wx:key 对照实验
- 任务三：WXS 响应事件（左滑删除）
- 任务四：FPS 对比
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 用 **WXS** 把格式化逻辑从逻辑层搬到渲染层，并说明它省掉了什么；
2. 通过**对照实验**证明 `wx:key` 缺失会导致组件状态**错位**，而不只是变慢；
3. 用 **WXS 响应事件**实现左滑删除，与逻辑层实现做 **FPS 对比**；
4. 说明 WXS 的语言限制，并给出"什么该放 WXS、什么不该"的判断依据。

<br>

> 对应 **第二章**。配套代码：`code-02/`

---

## 1.2 准备

```bash
cd code-02
npm install
```

导入项目 → 构建 npm → 勾选使用 npm 模块。

<br>

**打开性能监控**：

- 开发者工具：调试器 → Performance
- 真机：预览进入后，摇一摇 → 打开性能监控面板（或 `wx.setEnableDebug`）

**本实验的所有结论都必须来自真机。**

---

## 1.3 页面清单

| 页面 | 用途 |
|---|---|
| `pages/format/format` | 任务一：三种格式化方案对照 |
| `pages/key/key` | 任务二：`wx:key` 对照实验 |
| `pages/swipe/swipe` | 任务三 + 四：左滑删除，两种实现 |

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：WXS 格式化

---

## 2.1 三种方案

`pages/format/format` 里要实现同一个列表的三种渲染方式：

<!-- _class: smalltext -->

| 方案 | 做法 |
|---|---|
| **A 逻辑层预处理** | `setData` 前把 `priceText` / `titleShort` / `timeText` 都算好 |
| **B WXS** | `setData` 只传原始字段，模板里调 `fmt.price()` 等 |
| **C 错误示范** | 试图在模板里直接调用逻辑层函数（观察报错） |

<br>

**测量**：三种方案下 `setData` 的**数据字节数**与**往返耗时**。

---

## 2.2 补全 WXS

<!-- _class: smalltext -->

**文件**：`utils/fmt.wxs`

```js
// TODO-1: 分为「元」并保留两位小数，空值返回 '--'
function price(cent) {
  // 提示：WXS 没有模板字符串，只能用 '+' 拼接
}

// TODO-2: 超过 n 个字符时截断并加 '…'
function ellipsis(s, n) { }

// TODO-3: 时间戳 → 'MM-DD HH:mm'
// 提示：WXS 里用 getDate(ts) 取代 new Date(ts)，且没有 padStart
function time(ts) { }

// TODO-4: 根据库存返回类名：0 → 'sold-out'，<10 → 'low'，其余 ''
function stockClass(n) { }

module.exports = { price: price, ellipsis: ellipsis, time: time, stockClass: stockClass }
```

---

## 2.3 模板

```html
<wxs src="../../utils/fmt.wxs" module="fmt" />

<view wx:for="{{list}}" wx:key="id" class="row {{fmt.stockClass(item.stock)}}">
  <text class="title">{{ fmt.ellipsis(item.title, 12) }}</text>
  <text class="price">{{ fmt.price(item.priceInCent) }}</text>
  <text class="time">{{ fmt.time(item.createdAt) }}</text>
</view>
```

<br>

**要记录**：

1. 方案 A 与方案 B 的 `setData` 字节数各是多少？差多少倍？
2. 方案 C 报的**错误原文**是什么？

---

## 2.4 踩坑清单（先看再写）

<!-- _class: smalltext -->

```js
// ✗ WXS 里这些都不能用
const x = 1              // 用 var
(a) => a                 // 用 function
`${a}`                   // 用 '+'
[...arr]                 // 用 concat
arr.includes(x)          // 用 indexOf(x) >= 0
str.padStart(2, '0')     // 自己写：(n < 10 ? '0' : '') + n
new Date()               // 用 getDate()
JSON.stringify()         // 不可用
console.log()            // 不保证可用
```

<br>

**调试技巧**：WXS 无法打断点。
把中间值 `return` 出来临时渲染到界面上，或用 `ins.callMethod` 抛回逻辑层。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：wx:key 对照实验

---

## 3.1 实验设计

`pages/key/key` 上下并排两个列表，**内容完全相同**：

```html
<!-- 上：有 key -->
<view wx:for="{{list}}" wx:key="id" class="row">
  <input value="{{item.name}}" />
  <checkbox checked="{{item.checked}}" />
  <my-counter />           <!-- 内部有自己的 data.count -->
</view>

<!-- 下：无 key -->
<view wx:for="{{list}}" class="row">
  ... 同上 ...
</view>
```

<br>

`my-counter` 是一个自带 `count` 状态的组件，点一下加一。

---

## 3.2 操作步骤

<!-- _class: smalltext -->

1. 页面加载后，在**第 1 行**的 `input` 里输入 `AAA`，
   勾选**第 2 行**的 checkbox，把**第 3 行**的 counter 点到 `5`；
2. 点击「**在头部插入一条**」按钮；
3. **对比两个列表**：`AAA`、勾选、`5` 分别跑到哪一行去了？
4. 再点击「**逆序**」按钮，重复观察；
5. 点击「**删除第 2 条**」，重复观察。

<br>

**截图记录三次操作后两个列表的状态。**

---

## 3.3 补全代码

<!-- _class: smalltext -->

```js
// pages/key/key.js
methods: {
  // TODO-5: 在头部插入一条新数据
  prepend() {
    const item = { id: nextId(), name: '新增' + nextId(), checked: false }
    // 注意：这里要整体替换 list 才能触发重排，思考为什么不能用数据路径
  },

  // TODO-6: 逆序
  reverse() { },

  // TODO-7: 删除第 2 条
  removeSecond() { },

  // TODO-8: 记录一次 setData 的耗时，用于对比有无 key 的性能差异
  async measure(fn) { }
}
```

---

## 3.4 要回答的问题

1. 无 key 的列表在"头部插入"后，`input` 的值出现在哪一行？为什么？
2. 组件 `my-counter` 的 `count` 状态错位说明了什么？
   与 `input` 的错位是同一个原因吗？
3. `wx:key="index"` 与不写 `wx:key`，在这三个操作下表现有区别吗？请实测。
4. 性能上，1000 条数据做"头部插入"时，有 key 与无 key 的 `setData` 耗时差多少？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：WXS 响应事件

---

## 4.1 目标效果

<!-- _class: smalltext -->

```text
  ┌────────────────────────────┬────────┐
  │  商品名称  ￥12.34          │  删除  │  ← 左滑露出，最多 160rpx
  └────────────────────────────┴────────┘
     ↑ 跟手拖动，松手时吸附到 0 或 -160
```

要求：

1. 跟手拖动，**不掉帧**；
2. 松手时按位移过半吸附（0 或 -160rpx）；
3. 打开一行时**自动关闭其他行**；
4. 点击"删除"要通知逻辑层，弹确认框后真正删除。

---

## 4.2 逻辑层版本（先写这个作为对照）

<!-- _class: smalltext -->

```js
// pages/swipe/swipe.js
methods: {
  onTouchStart(e) {
    this._startX = e.touches[0].pageX
    this._index = e.currentTarget.dataset.index
    this._origin = this.data.offsets[this._index] || 0
  },
  onTouchMove(e) {
    // TODO-9: 计算位移并 setData 到 offsets[index]
    // 这里每次 touchmove 都会 setData —— 这正是要对比的「坏」实现
  },
  onTouchEnd(e) {
    // TODO-10: 吸附到 0 或 -160rpx
  }
}
```

```html
<view class="cell" style="transform:translateX({{offsets[index]}}rpx)"
      bindtouchstart="onTouchStart" bindtouchmove="onTouchMove" bindtouchend="onTouchEnd"
      data-index="{{index}}">
```

---

## 4.3 WXS 版本

<!-- _class: tinytext -->

```js
// utils/swipe.wxs
var MAX = -160

function touchstart(e, ins) {
  var st = ins.getState()
  st.startX = e.touches[0].pageX
  st.origin = st.x || 0
  return false
}

function touchmove(e, ins) {
  var st = ins.getState()
  // TODO-11: 计算 dx，把 st.x 限制在 [MAX_px, 0]，然后 setStyle
  var dx = e.touches[0].pageX - st.startX
  st.x = Math.max(px(MAX), Math.min(0, st.origin + dx))
  ins.selectComponent('.cell').setStyle({ transform: 'translateX(' + st.x + 'px)' })
  return false
}

function touchend(e, ins) {
  var st = ins.getState()
  // TODO-12: 位移超过一半吸附到 MAX，否则回到 0；加 transition 让吸附有动画
  // TODO-13: 用 ins.callMethod('onSwipeEnd', { index: ..., open: ... }) 通知逻辑层
}

function px(rpx) { /* TODO-14: rpx → px，提示 ins.getState() 里可缓存屏宽 */ }

module.exports = { touchstart: touchstart, touchmove: touchmove, touchend: touchend }
```

---

## 4.4 绑定

```html
<wxs src="../../utils/swipe.wxs" module="swipe" />

<view class="row" wx:for="{{list}}" wx:key="id"
      data-index="{{index}}"
      bindtouchstart="{{swipe.touchstart}}"
      bindtouchmove="{{swipe.touchmove}}"
      bindtouchend="{{swipe.touchend}}">
  <view class="cell">
    <text>{{item.title}}</text>
  </view>
  <view class="action" catchtap="confirmDelete" data-id="{{item.id}}">删除</view>
</view>
```

<br>

**注意**：`ins.selectComponent('.cell')` 选的是**当前事件节点内部**的 `.cell`，
不是全局。多行时不会互相干扰。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：FPS 对比

---

## 5.1 测量方法

<!-- _class: smalltext -->

**真机性能面板**（推荐）：

1. 预览进入小程序；
2. 摇一摇 → 打开调试 → 性能监控；
3. 在列表上**连续快速左滑 10 次**，观察 FPS 曲线最低点。

**代码内测量**（辅助）：

```js
// utils/fps.js
export function startFps(onSample) {
  let last = Date.now(), frames = 0
  const loop = () => {
    frames++
    const now = Date.now()
    if (now - last >= 1000) { onSample(frames); frames = 0; last = now }
    this._raf = wx.nextTick(loop)      // 小程序里没有 rAF，用 nextTick 近似
  }
  loop()
}
```

> `nextTick` 不等价于 `requestAnimationFrame`，只能做**相对比较**，
> 绝对值请以真机性能面板为准。

---

## 5.2 对比表

在**同一台真机**、**同样的滑动动作**下测量：

| 实现 | 列表长度 | FPS 最低 | FPS 平均 | 主观跟手感 |
|---|---|---|---|---|
| 逻辑层 setData | 50 | | | |
| 逻辑层 setData | 500 | | | |
| WXS | 50 | | | |
| WXS | 500 | | | |

<br>

**必答**：为什么列表变长时，**逻辑层版本**掉帧更明显，
而 **WXS 版本**几乎不受影响？

---

## 5.3 进阶观察

<!-- _class: smalltext -->

在滑动的同时，让逻辑层跑一个耗时任务：

```js
// pages/swipe/swipe.js
methods: {
  makeBusy() {
    // TODO-15: 每 100ms 跑一次 30ms 的同步计算，持续 5 秒
    this._busy = setInterval(() => {
      const end = Date.now() + 30
      while (Date.now() < end) { /* 空转 */ }
    }, 100)
    setTimeout(() => clearInterval(this._busy), 5000)
  }
}
```

<br>

点击"制造逻辑层繁忙"后立即滑动，对比两种实现：

**这正是双线程架构的核心价值** —— 请用你的数据说明它。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 验收标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 15 个 TODO 全部补全，三个页面均可在真机运行 | 20 |
| 2 | WXS 格式化正确（含空值、边界），方案 A/B 字节数对比完整 | 15 |
| 3 | `wx:key` 对照实验三次操作截图齐全，错位现象解释正确 | 20 |
| 4 | 左滑删除两种实现均可用，满足互斥打开与确认删除 | 20 |
| 5 | FPS 对比表完整（4 组），含"逻辑层繁忙"场景 | 15 |
| 6 | 报告结论有数据支撑，正确解释了双线程的收益 | 10 |

---

## 6.2 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| WXS 里写 `const` 直接编译失败 | WXS 不支持 ES6 | 全部改 `var` / `function` |
| `ins.selectComponent` 返回 null | 选择器写错或节点在事件节点外 | 选择器相对于**绑定事件的节点** |
| 拖动时整页跟着滚 | 没有 `return false` 阻止默认 | `touchmove` 返回 `false` |
| 松手后没有动画 | 拖动时也带了 transition | 拖动时清空 transition，松手时再加 |
| 多行同时打开 | 没实现互斥 | `callMethod` 通知逻辑层关闭其他行 |
| 真机 FPS 面板打不开 | 用了"真机调试"模式 | 改用"预览" |

---

## 6.3 拓展（选做，加分）

1. 给左滑删除加**回弹**动画（超出 MAX 时按 0.3 倍阻尼继续，松手弹回）；
2. 用 WXS 实现一个**下拉刷新**：下拉时头部跟手放大，
   超过阈值松手才 `callMethod` 触发刷新；
3. 把 `pages/key/key` 的列表扩到 5000 条，
   引入 `miniprogram-recycle-view` 重做，对比首次渲染耗时与滚动 FPS；
4. 在 Skyline 渲染模式下重跑任务三，用 **Worklet 动画**替代 WXS，比较三者。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验二 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
