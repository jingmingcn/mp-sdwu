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

# 实验三 可复用星级评分组件

###### “麻雀虽小，五脏俱全。”

张丽，井明
数据科学与计算机学院
jingming@sdu.edu.cn
2026年秋

---

<!-- _header: 目录<br>CONTENTS<br>![](images/logo-1_transparent.png)-->
<!-- _class: toc_b -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

- 实验目标与需求
- 任务一：基础实现
- 任务二：受控与非受控
- 任务三：observers 派生状态
- 任务四：样式接口与 behavior
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与需求

---

## 1.1 实验目标

1. 用 `Component` 构造器实现一个**生产可用**的组件，而不是"能跑就行"；
2. 掌握 `properties` / `observers` / `lifetimes` / `externalClasses` 的正确用法；
3. 实现**受控 + 非受控**双模式，理解两者的取舍；
4. 用 `virtualHost`、CSS 变量、`behaviors` 让组件真正可复用；
5. 写出组件的 **README（属性表 / 事件表 / 样式接口表）**。

<br>

> 对应 **第三章**。配套代码：`code-03/`

---

## 1.2 需求规格

<!-- _class: smalltext -->

| 属性 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `value` | Number | `undefined` | 传入即**受控** |
| `defaultValue` | Number | `0` | 非受控模式的初始值 |
| `max` | Number | `5` | 星星总数 |
| `allowHalf` | Boolean | `false` | 允许半星 |
| `readonly` | Boolean | `false` | 只读，不响应点击 |
| `size` | Number | `48` | 单星尺寸(rpx) |
| `gap` | Number | `8` | 星间距(rpx) |
| `texts` | Array | `[]` | 分值对应的描述文字，如 `['很差','较差','一般','满意','非常满意']` |

---

## 1.3 需求规格（续）

<!-- _class: smalltext -->

**事件**

| 事件 | detail | 时机 |
|---|---|---|
| `change` | `{ value: Number }` | 用户点击改变分值 |
| `hover` | `{ value: Number }` | 拖动过程中的预览值（选做） |

**外部样式类**

| 类名 | 作用 |
|---|---|
| `star-class` | 单颗星 |
| `text-class` | 描述文字 |

**CSS 变量**

| 变量 | 默认 | 作用 |
|---|---|---|
| `--star-active-color` | `#f5a623` | 点亮颜色 |
| `--star-inactive-color` | `#dcdcdc` | 未点亮颜色 |

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：基础实现

---

## 2.1 骨架

<!-- _class: smalltext -->

**文件**：`components/star-rating/index.js`

```js
Component({
  options: {
    virtualHost: true,           // 组件节点不生成，避免破坏父级 flex
    pureDataPattern: /^_/,       // _ 开头的字段不参与渲染
    multipleSlots: false
  },
  externalClasses: ['star-class', 'text-class'],
  properties: {
    value:        { type: Number, optionalTypes: [null], value: null },
    defaultValue: { type: Number, value: 0 },
    max:          { type: Number, value: 5 },
    allowHalf:    { type: Boolean, value: false },
    readonly:     { type: Boolean, value: false },
    size:         { type: Number, value: 48 },
    gap:          { type: Number, value: 8 },
    texts:        { type: Array,  value: [] }
  },
  data: { stars: [], current: 0, text: '', _inner: 0 },
  observers: { /* 任务三 */ },
  methods: { /* 任务一、二 */ }
})
```

---

## 2.2 模板

<!-- _class: smalltext -->

**文件**：`components/star-rating/index.wxml`

```html
<view class="star-rating" style="--gap:{{gap}}rpx">
  <view wx:for="{{stars}}" wx:key="index"
        class="star star-class {{item.state}}"
        style="width:{{size}}rpx;height:{{size}}rpx"
        data-index="{{index}}"
        bindtap="onTap">
    <!-- TODO-1: 用两层 view 叠加实现半星
         底层：灰色整星；上层：金色，宽度按 item.ratio 裁剪 -->
    <view class="star-bg"></view>
    <view class="star-fg" style="width:{{item.ratio * 100}}%"></view>
  </view>
  <text wx:if="{{text}}" class="star-text text-class">{{text}}</text>
</view>
```

<br>

**提示**：半星用 `overflow: hidden` + 内层固定宽度实现，
不要用两个不同的图标——那样无法支持任意比例。

---

## 2.3 点击处理

<!-- _class: smalltext -->

```js
methods: {
  // TODO-2: 处理点击
  onTap(e) {
    if (this.data.readonly) return

    const index = e.currentTarget.dataset.index      // 0 起
    // 提示：半星模式下需要知道点在星星的左半还是右半
    // 用 e.detail.x（tap 事件带的页面坐标）与该星的 boundingClientRect 比较
    // 但 SelectorQuery 是异步的 —— 想想有没有更好的办法

    const next = /* ... */
    this.commit(next)
  },

  // TODO-3: 统一的提交入口（受控/非受控在这里分叉，见任务二）
  commit(next) { }
}
```

<br>

**思考**：半星判定需要知道点击位置在星内的相对比例。
`SelectorQuery` 是异步的，每次点击都查一次会有延迟。
**更好的办法**：在 `ready` 里量一次并缓存，或改用 `touchstart` 的 `pageX`。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：受控与非受控

---

## 3.1 判定规则

```js
// TODO-4: 实现 isControlled
get isControlled() {
  // value 被显式传入（不是 null/undefined）时为受控
}
```

<!-- _class: smalltext -->

| 模式 | 触发条件 | 行为 |
|---|---|---|
| **非受控** | 使用方没传 `value` | 组件内部维护 `_inner`，点击后自己改，同时 `triggerEvent` |
| **受控** | 使用方传了 `value` | 组件**不改自己的状态**，只 `triggerEvent`；界面由父级传回的 `value` 决定 |

```js
commit(next) {
  if (!this.isControlled) this.setData({ _inner: next })   // 非受控：自己改
  this.triggerEvent('change', { value: next })             // 两种模式都要抛
}
```

---

## 3.2 两种用法的演示页

<!-- _class: smalltext -->

`pages/demo/demo.wxml` 中必须同时演示：

```html
<!-- 非受控：组件自己管，父级只收通知 -->
<star-rating default-value="{{3}}" bind:change="onUncontrolled" />
<text>父级收到的值：{{uncontrolledValue}}</text>

<!-- 受控：父级说了算 -->
<star-rating value="{{controlled}}" bind:change="onControlled" />
<text>当前值：{{controlled}}</text>
<button bindtap="reset">父级强制重置为 0</button>

<!-- 受控 + 拒绝修改：验证组件确实没有自作主张 -->
<star-rating value="{{2}}" bind:change="onRejected" />
<text>这个永远是 2，点击无效（父级不更新）</text>
```

<br>

**验收要点**：第三个组件点击后**界面必须纹丝不动**。
如果动了，说明你的受控实现是假的。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：observers 派生状态

---

## 4.1 派生什么

模板里**不允许出现任何计算**。以下三个字段全部由 `observers` 派生：

<!-- _class: smalltext -->

| 字段 | 来源 |
|---|---|
| `current` | 受控时取 `value`，非受控时取 `_inner` |
| `stars` | `[{ ratio: 1 }, { ratio: 0.5 }, { ratio: 0 }, ...]`，长度为 `max` |
| `text` | `texts[Math.ceil(current) - 1] \|\| ''` |

```js
observers: {
  // TODO-5: 监听 value、_inner、max、texts
  'value, _inner, max, texts': function (value, inner, max, texts) {
    const current = /* ... */
    const stars = Array.from({ length: max }, (_, i) => ({
      ratio: /* 第 i 颗星的填充比例，0 ~ 1 */
    }))
    this.setData({ current, stars, text: /* ... */ })
  }
}
```

---

## 4.2 初始化问题

<!-- _class: smalltext -->

`observers` **不会**因为 `data` 的初始值而触发。
组件首次渲染时 `stars` 是空数组，界面上什么都没有。

```js
lifetimes: {
  attached() {
    // TODO-6: 用 defaultValue 初始化 _inner，从而触发一次 observers
    // 注意：受控模式下不应该动 _inner
  }
}
```

<br>

**验证**：把 `defaultValue` 设成 `3`，页面加载后应立即显示三颗金星，
**不需要**用户点一下才出现。

---

## 4.3 半星的 ratio 计算

$$
\text{ratio}_i = \mathrm{clamp}(\text{current} - i,\ 0,\ 1)
$$

<!-- _class: smalltext -->

| current | i=0 | i=1 | i=2 | i=3 | i=4 |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |
| 3 | 1 | 1 | 1 | 0 | 0 |
| 3.5 | 1 | 1 | 1 | **0.5** | 0 |
| 5 | 1 | 1 | 1 | 1 | 1 |

```js
// TODO-7: 实现 clamp
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
```

<br>

这个公式同时支持整星与半星，甚至任意小数比例（如 4.3 星）——
**不要**写 `if (allowHalf) ... else ...` 的两套分支。

---

## 4.4 防死循环

```js
// ✗ 这样写会无限触发
observers: {
  'current': function (c) { this.setData({ current: c }) }
}
```

<br>

**规则**：

1. `observers` 监听的字段，**不能**在同一个 observer 里 `setData`；
2. 派生字段（`stars`/`text`/`current`）**只写不监听**；
3. 源字段（`value`/`_inner`/`max`/`texts`）**只监听不写**（除了 `commit`）。

**自查**：画一张"谁监听谁、谁写谁"的图，确认没有环。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：样式接口与 behavior

---

## 5.1 CSS 变量

<!-- _class: smalltext -->

```css
/* components/star-rating/index.wxss */
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: var(--gap, 8rpx);
}
.star { position: relative; overflow: hidden; }
.star-bg, .star-fg {
  position: absolute; inset: 0;
  background-repeat: no-repeat; background-size: auto 100%;
}
/* TODO-8: 用 --star-inactive-color / --star-active-color 着色
   提示：用 mask 或 svg data-uri 背景，配合 background-color */
.star-bg { background-color: var(--star-inactive-color, #dcdcdc); }
.star-fg { background-color: var(--star-active-color, #f5a623); }
```

```css
/* pages/demo/demo.wxss —— 使用方换肤，不需要改组件一行代码 */
.theme-red { --star-active-color: #c0392b; }
```

**验证**：CSS 变量在 `styleIsolation: isolated` 下**依然能穿透**——
请在报告里给出截图证明。

---

## 5.2 externalClasses

```html
<!-- 使用方 -->
<star-rating star-class="big-star" text-class="gray-text" />
```

```css
/* 使用方的 wxss */
.big-star { transform: scale(1.2); }
.gray-text { color: #999; font-size: 24rpx; }
```

<br>

**注意**：`externalClasses` 的样式**优先级低于**组件内部样式，
需要覆盖时使用方要加 `!important` 或提高选择器权重。

**在报告里说明**：`externalClasses` 与 CSS 变量各自适合什么场景？

---

## 5.3 抽出 behavior

<!-- _class: smalltext -->

`readonly` + `disabled` 的处理逻辑在很多组件里都要用，抽成 behavior：

```js
// behaviors/interactive.js
module.exports = Behavior({
  properties: {
    readonly: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false }
  },
  data: { _i_locked: false },
  observers: {
    'readonly, disabled': function (r, d) { this.setData({ _i_locked: r || d }) }
  },
  methods: {
    // TODO-9: 返回是否可交互；组件在事件处理开头调用它
    canInteract() { return !this.data._i_locked }
  }
})
```

```js
// star-rating/index.js
Component({
  behaviors: [require('../../behaviors/interactive')],
  methods: { onTap(e) { if (!this.canInteract()) return; /* ... */ } }
})
```

**注意**：behavior 里的 `data` 字段加了 `_i_` 前缀，降低与宿主组件的冲突概率。

---

## 5.4 写 README

<!-- _class: smalltext -->

**文件**：`components/star-rating/README.md`

必须包含四张表 + 一段用法示例：

```markdown
## star-rating 星级评分

### 用法
​```html
<star-rating value="{{score}}" max="{{5}}" allow-half bind:change="onChange" />
​```

### 属性
| 属性 | 类型 | 默认值 | 说明 |
...

### 事件
| 事件 | detail | 触发时机 |
...

### 外部样式类
### CSS 变量
### 注意事项
- 同时传 value 和 defaultValue 时，以 value 为准（受控优先）
- readonly 时不会触发 change
```

> **没有 README 的组件视为未完成。**

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 功能验收清单

<!-- _class: smalltext -->

- [ ] 点击第 3 颗星，`change` 的 `detail.value === 3`
- [ ] `allowHalf` 时点击第 3 颗星左半，值为 `2.5`
- [ ] `readonly` 时点击无任何反应，不触发 `change`
- [ ] `defaultValue=3` 时**首次渲染**就显示 3 星（不需要点击）
- [ ] 受控模式下父级不更新，界面不变
- [ ] 父级把 `value` 从 5 改成 2，界面立即跟随
- [ ] `max=10` 时渲染 10 颗星
- [ ] `texts` 传入 5 项时，选 4 星显示对应文字
- [ ] 使用方设置 `--star-active-color: red` 后星星变红
- [ ] 组件放进 `display:flex` 的父容器里**不会**破坏布局（验证 `virtualHost`）
- [ ] 一个页面里放 3 个组件，互不干扰

---

## 6.2 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 9 个 TODO 全部补全，功能验收清单全部通过 | 30 |
| 2 | 受控/非受控实现正确（第三个演示组件确实不动） | 15 |
| 3 | 模板中**没有任何计算表达式**，全部由 observers 派生 | 15 |
| 4 | `ratio` 用统一公式实现，不写 allowHalf 的分支 | 10 |
| 5 | CSS 变量 + externalClasses 均可用，有换肤截图 | 10 |
| 6 | behavior 抽取合理，前缀规范 | 5 |
| 7 | README 四张表完整，含注意事项 | 15 |

---

## 6.3 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 首次渲染没有星星 | `observers` 不被初始 data 触发 | 在 `attached` 里初始化一次 |
| 组件把父级 flex 撑坏 | 没开 `virtualHost` | `options: { virtualHost: true }` |
| 受控模式点击后界面也变了 | `commit` 里无条件 `setData` | 判断 `isControlled` |
| 半星比例不对 | 用了 `index+1` 而不是 `index` | 复核 `clamp(current - i, 0, 1)` |
| 外部样式类不生效 | 优先级不够 | 提高权重或用 CSS 变量 |
| 多个组件互相影响 | 用了页面级选择器或全局样式 | 保持 `isolated` |

---

## 6.4 拓展（选做，加分）

1. 支持**拖动选择**：按住在星条上滑动实时预览，抬手确认；
   高频场景请用 **WXS 响应事件**实现预览。
2. 支持**任意图标**：通过 `slot` 或 `icon` 属性让使用方换成爱心、拇指。
3. 加上 `wx://component-export`，只对外暴露 `reset()` 与 `getValue()`。
4. 为 `clamp` / `deriveStars` 这类纯函数补 Jest 单测（为第十二章做准备）。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验三 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
