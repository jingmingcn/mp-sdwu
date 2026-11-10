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

# 实验四 发布一个 npm 组件包

###### “独乐乐，不如众乐乐。”

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
- 任务一：relations 实现 tabs
- 任务二：component-export
- 任务三：打包为 npm 组件包
- 任务四：本地联调与文档
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 用 `relations` 实现 `tabs` / `tab` 这类**成组组件**，并理解为什么 `properties` 做不到；
2. 用 `wx://component-export` 定义**命令式 API 契约**；
3. 把实验三的 `star-rating` 与本次的 `tabs` 打包成 **npm 组件包 `sdwu-ui`**；
4. 完成**本地联调**（`npm pack` / `npm link`），并写出符合规范的包文档与 CHANGELOG。

<br>

> 对应 **第四章**。配套代码：`code-04/`

---

## 1.2 目录结构

<!-- _class: smalltext -->

```text
code-04/
├── sdwu-ui/                    # 组件包（要发布的东西）
│   ├── package.json            # 关键：miniprogram 字段
│   ├── README.md  CHANGELOG.md
│   ├── src/
│   │   ├── star-rating/        # 从实验三拷过来
│   │   ├── tabs/
│   │   ├── tab/
│   │   └── behaviors/tab-relation.js
│   ├── miniprogram_dist/       # 构建产物
│   └── tools/build.js
└── demo/                       # 使用方小程序
    ├── app.json  package.json
    └── pages/demo/
```

```bash
cd code-04/sdwu-ui && npm install
cd ../demo && npm install
```

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：relations 实现 tabs

---

## 2.1 目标用法

```html
<sd-tabs current="{{0}}" bind:change="onTabChange">
  <sd-tab title="全部" badge="{{12}}">
    <goods-list type="all" />
  </sd-tab>
  <sd-tab title="待付款">
    <goods-list type="unpaid" />
  </sd-tab>
  <sd-tab title="已完成" disabled>
    <goods-list type="done" />
  </sd-tab>
</sd-tabs>
```

<br>

**难点**：`sd-tabs` 必须知道它下面有 3 个 tab、标题分别是什么、
哪个被禁用——但这些 tab 是**使用方**写在插槽里的。

---

## 2.2 用 behavior 做关系标记

<!-- _class: smalltext -->

**文件**：`src/behaviors/tab-relation.js`

```js
// 两个空 behavior，只作为 relations 的 target 标识
// 好处：组件移动目录、打成 npm 包后关系依然成立
exports.TABS = Behavior({})
exports.TAB = Behavior({})
```

```js
// src/tabs/index.js
const { TABS, TAB } = require('../behaviors/tab-relation')

Component({
  behaviors: [TABS],
  relations: {
    tab: {
      type: 'child',
      target: TAB,
      // TODO-1: linked / linkChanged / unlinked 都要重新同步
      linked() { this.syncTabs() },
      linkChanged() { this.syncTabs() },
      unlinked() { this.syncTabs() }
    }
  }
})
```

---

## 2.3 同步逻辑

<!-- _class: smalltext -->

```js
// src/tabs/index.js
properties: { current: { type: Number, value: 0 } },
data: { titles: [], activeIndex: 0 },

methods: {
  // TODO-2: 从关联节点读出标题/徽标/禁用状态，并激活当前项
  syncTabs() {
    const nodes = this.getRelationNodes('tab')
    this.setData({
      titles: nodes.map(n => ({
        title: n.data.title,
        badge: n.data.badge,
        disabled: n.data.disabled
      }))
    })
    this.activate(this.data.activeIndex)
  },

  // TODO-3: 只让第 index 个 tab 可见
  activate(index) {
    const nodes = this.getRelationNodes('tab')
    nodes.forEach((n, i) => n.setActive(i === index))
    this.setData({ activeIndex: index })
  },

  // TODO-4: 点击标题栏，跳过 disabled 项，触发 change
  onTitleTap(e) { }
}
```

---

## 2.4 子组件

```js
// src/tab/index.js
const { TAB, TABS } = require('../behaviors/tab-relation')

Component({
  behaviors: [TAB],
  options: { virtualHost: true },
  relations: { tabs: { type: 'parent', target: TABS } },
  properties: {
    title: String,
    badge: { type: Number, value: 0 },
    disabled: { type: Boolean, value: false }
  },
  data: { active: false, everActive: false },
  methods: {
    // TODO-5: 首次激活后改用 hidden，保留内部状态（回顾第三章 slot + wx:if 的坑）
    setActive(active) { }
  }
})
```

```html
<!-- src/tab/index.wxml -->
<view wx:if="{{everActive}}" hidden="{{!active}}"><slot></slot></view>
```

---

## 2.5 必答问题

1. 为什么 `relations` 用 `target: BEHAVIOR` 比用相对路径字符串更好？
   请构造一个"用路径会失效"的场景并验证。
2. `linked` 回调与子组件的 `attached` 谁先执行？请打点验证。
3. 使用方用 `wx:for` 动态生成 tab 时，
   增删一项会触发哪些 relations 回调？请打点记录完整序列。
4. `sd-tab` 为什么要开 `virtualHost`？不开会怎样？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：component-export

---

## 3.1 定义 API 契约

<!-- _class: smalltext -->

```js
// src/tabs/index.js
Component({
  behaviors: [TABS, 'wx://component-export'],
  export() {
    return {
      // TODO-6: 只暴露这四个方法，内部实现完全隐藏
      switchTo: (index) => this.activate(index),
      next: () => this.activate(Math.min(this.data.activeIndex + 1, this.data.titles.length - 1)),
      prev: () => this.activate(Math.max(this.data.activeIndex - 1, 0)),
      getCurrent: () => this.data.activeIndex
    }
  }
})
```

```js
// 使用方
const tabs = this.selectComponent('#tabs')
tabs.switchTo(2)
console.log(tabs.getCurrent())   // 2
console.log(tabs.setData)        // undefined —— 内部方法拿不到
```

---

## 3.2 验证封装边界

在 `pages/demo/demo.js` 里写一段验证代码：

<!-- _class: smalltext -->

```js
// TODO-7: 逐项打印并记录结果
verifyExport() {
  const tabs = this.selectComponent('#tabs')
  console.log('switchTo:', typeof tabs.switchTo)      // 期望 'function'
  console.log('setData:', typeof tabs.setData)        // 期望 'undefined'
  console.log('data:', tabs.data)                     // 期望 undefined
  console.log('activate:', typeof tabs.activate)      // 期望 'undefined'
}
```

<br>

**在报告里说明**：
如果不用 `component-export`，使用方能拿到什么？
这在组件库长期维护中会带来什么问题？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：打包为 npm 组件包

---

## 4.1 package.json

<!-- _class: smalltext -->

```json
{
  "name": "sdwu-ui",
  "version": "1.0.0",
  "description": "山大移动端课程 UI 组件库",
  "miniprogram": "miniprogram_dist",
  "main": "miniprogram_dist/index.js",
  "files": ["miniprogram_dist", "README.md", "CHANGELOG.md"],
  "keywords": ["miniprogram", "weapp", "components"],
  "scripts": {
    "build": "node tools/build.js",
    "prepublishOnly": "npm run build"
  },
  "license": "MIT"
}
```

<br>

**核心是 `"miniprogram": "miniprogram_dist"`**。
**实验**：把这行删掉，重新构建 npm，记录发生了什么（`.wxml` 会怎样？）。

---

## 4.2 构建脚本

<!-- _class: smalltext -->

**文件**：`tools/build.js`

```js
const fs = require('fs'), path = require('path')
const SRC = path.join(__dirname, '../src')
const DIST = path.join(__dirname, '../miniprogram_dist')

// TODO-8: 实现 build
// 1. 清空 DIST
// 2. 递归拷贝 SRC 下的 .js/.json/.wxml/.wxss
// 3. 生成 DIST/index.js，导出所有组件路径常量（便于使用方引用）
// 4. 校验：每个组件目录必须同时有 index.js / index.json / index.wxml
//    缺失就报错退出（这是最容易漏掉 .wxml 的地方）

function build() { }
build()
```

<br>

**为什么要校验**：漏掉 `.wxml` 时，构建 npm 不会报错，
但使用方渲染出来是**空白**——非常难排查。

---

## 4.3 组件内引用规则

```js
// ✓ 包内互相引用必须用相对路径
const { clamp } = require('../utils/math')
const { TAB } = require('../behaviors/tab-relation')

// ✗ 不能用包名自引用（构建 npm 后路径会错）
const { clamp } = require('sdwu-ui/utils/math')
```

```json
// 组件的 json 里引用同包组件，也用相对路径
{ "usingComponents": { "sd-tab": "../tab/index" } }
```

<br>

**验证**：构建后打开 `demo/miniprogram_npm/sdwu-ui/`，
确认目录结构与 `miniprogram_dist` 一致，且相对路径都能解析。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：本地联调与文档

---

## 5.1 两种联调方式

<!-- _class: smalltext -->

**方式 A：npm pack（推荐，更稳）**

```bash
cd sdwu-ui
npm run build && npm pack          # 得到 sdwu-ui-1.0.0.tgz
cd ../demo
npm i ../sdwu-ui/sdwu-ui-1.0.0.tgz
```

**方式 B：npm link（改代码立即生效，但工具监听不稳）**

```bash
cd sdwu-ui && npm link
cd ../demo && npm link sdwu-ui
```

<br>

两种方式都需要在开发者工具里**重新执行「构建 npm」**。

**实验**：改一行组件源码，分别用 A/B 两种方式看多久能在 demo 里生效，
记录你的观察。

---

## 5.2 使用方配置

```json
// demo/app.json —— 高频组件全局注册
{
  "usingComponents": {
    "sd-tabs": "sdwu-ui/tabs/index",
    "sd-tab": "sdwu-ui/tab/index"
  },
  "lazyCodeLoading": "requiredComponents"
}
```

```json
// demo/pages/demo/demo.json —— 低频组件页面级注册
{
  "usingComponents": { "star-rating": "sdwu-ui/star-rating/index" }
}
```

<br>

**注意路径里没有 `miniprogram_dist`** ——
`"miniprogram"` 字段已经告诉工具从哪里找。

---

## 5.3 体积检查

在 demo 里做两次对比：

<!-- _class: smalltext -->

| 配置 | 主包体积 | 启动注入耗时 |
|---|---|---|
| 组件全部全局注册，**不开** `lazyCodeLoading` | | |
| 组件全部全局注册，**开启** `lazyCodeLoading` | | |
| 组件改为页面级注册 | | |

<br>

**测量方法**：开发者工具 → 详情 → 基本信息 → 代码依赖分析；
启动耗时用实验一的 `perf.js`。

**结论**：`lazyCodeLoading` 对本例的收益有多大？为什么？

---

## 5.4 文档要求

<!-- _class: smalltext -->

**`README.md`** 必须包含：

1. 安装与构建 npm 的完整步骤（假设读者从没用过）；
2. 每个组件的**属性表 / 事件表 / 外部样式类表 / CSS 变量表**；
3. 每个组件的最小可运行示例；
4. 注意事项（如 `sd-tab` 必须是 `sd-tabs` 的直接子节点）。

**`CHANGELOG.md`** 至少三条记录，其中**必须有一条破坏性变更**并写出迁移指引：

```markdown
## [2.0.0] - 2026-11-01
### Breaking
- `sd-tabs` 的 `change` 事件 detail 由 `{ index }` 改为 `{ current }`
  迁移：`e.detail.index` → `e.detail.current`
```

---

## 5.5 版本演练

按语义化版本，为下列变更各定一个版本号并写进 CHANGELOG：

<!-- _class: smalltext -->

| # | 变更 | 版本 | 理由 |
|---|---|---|---|
| 1 | `sd-tab` 新增可选属性 `icon` | | |
| 2 | 修复 `disabled` 的 tab 仍能被 `switchTo` 切到 | | |
| 3 | `star-rating` 的 `change` detail 从 `{score}` 改为 `{value}` | | |
| 4 | 把 `externalClasses` 的 `star-class` 改名为 `item-class` | | |
| 5 | 内部把 `observers` 重构成多个小函数，外部行为不变 | | |

<br>

**第 3、4 项是陷阱**——想清楚它们对使用方意味着什么。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 8 个 TODO 全部补全，demo 可运行 | 20 |
| 2 | `sd-tabs` / `sd-tab` 功能完整（切换、徽标、禁用、状态保留） | 20 |
| 3 | relations 用 behavior 作 target；四个必答问题有实测记录 | 15 |
| 4 | `component-export` 封装边界验证结果正确 | 10 |
| 5 | 构建脚本含**完整性校验**，删掉 `miniprogram` 字段的实验有记录 | 10 |
| 6 | 本地联调成功，三组体积/启动数据完整 | 10 |
| 7 | README 表格齐全 + CHANGELOG 含破坏性变更与迁移指引 | 10 |
| 8 | 版本演练五项判断正确 | 5 |

---

## 6.2 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| 组件渲染空白 | `miniprogram_dist` 里少了 `.wxml` | 构建脚本加完整性校验 |
| `getRelationNodes` 返回空数组 | `target` 指向的 behavior 不是同一个模块实例 | 确认没有重复打包 behavior |
| 构建 npm 报错找不到包 | `demo/package.json` 里没装 | 检查 `dependencies` |
| 改了源码 demo 没变 | `npm link` 的监听失效 | 重新构建 npm；或改用 `npm pack` |
| tab 切换后内部状态丢失 | 用了 `wx:if` 销毁节点 | 首次激活后改 `hidden` |
| 使用方引用路径带了 `miniprogram_dist` | 误解了 `miniprogram` 字段 | 路径从包名后直接写组件目录 |

---

## 6.3 拓展（选做，加分）

1. 给 `sd-tabs` 加**滑动切换**（配合 `swiper`）与**标题栏自动滚动居中**；
2. 用**抽象节点**（`componentGenerics`）让使用方决定标题栏的渲染组件；
3. 给组件包加 `prepublishOnly`：先跑 ESLint 与 Jest，任一失败则拒绝发布；
4. 把包发到 **npm 私有 registry**（或 GitHub Packages），
   在另一个空白小程序里从零走一遍安装流程，记录每一步耗时与踩坑。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验四 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
