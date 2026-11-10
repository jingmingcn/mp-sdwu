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

# 实验五 MobX 购物车

###### “纲举而目张。”

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
- 任务一：cartStore
- 任务二：绑定到页面与组件
- 任务三：持久化与角标
- 任务四：Store 单元测试
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

1. 用 MobX 实现一个**跨页面共享**的购物车，理解 `observable` / `computed` / `action`；
2. 用 `ComponentWithStore` / `BehaviorWithStore` 完成绑定，
   验证**多个页面自动同步**；
3. 实现 **Storage 持久化**与 **TabBar 角标**同步（`autorun` / `reaction`）；
4. 为 Store 写 **Jest 单元测试**，验证"状态层不依赖 `wx.*`"的价值。

<br>

> 对应 **第五章**。配套代码：`code-05/`

---

## 1.2 准备

```bash
cd code-05
npm install       # mobx-miniprogram, mobx-miniprogram-bindings
```

导入项目 → **构建 npm** → 勾选**使用 npm 模块**。

<br>

**页面清单**：

| 页面 | 说明 |
|---|---|
| `pages/goods/goods` | 商品列表，可加入购物车（tabBar） |
| `pages/cart/cart` | 购物车，改数量/勾选/删除（tabBar） |
| `pages/mine/mine` | 我的，只显示件数与总价（验证跨页同步） |

---

## 1.3 数据形态

```js
// 购物车项
{
  id: 1,
  title: '山大文创帆布包',
  cover: 'https://...',
  priceInCent: 5900,     // ⚠ 一律用「分」存储，避免浮点误差
  qty: 2,
  checked: true,
  stock: 10
}
```

<br>

**规范**：金额全程用**整数分**，只在**渲染前一刻**转成"元"字符串。
这是电商类项目的铁律。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：cartStore

---

## 2.1 状态与派生

<!-- _class: smalltext -->

**文件**：`stores/cart.js`

```js
import { observable, action } from 'mobx-miniprogram'

export const cartStore = observable({
  items: [],

  // ── computed（getter）──
  // TODO-1: 勾选项
  get checkedItems() { },
  // TODO-2: 总件数（所有项的 qty 之和，不论是否勾选）
  get count() { },
  // TODO-3: 勾选项的总金额（分）
  get totalInCent() { },
  // TODO-4: 展示用的总金额文本，如 '￥118.00'
  get totalText() { },
  // TODO-5: 是否全选（空购物车时为 false）
  get allChecked() { },
  // TODO-6: 渲染用的精简列表 —— 只保留模板真正用到的字段 + 预格式化好的文本
  get viewList() { }
})
```

**注意 TODO-6**：这是本实验的重点。
`fields` 绑什么就 `setData` 什么，直接绑 `items` 会把 `stock`、`cover` 原图 URL 等全传过去。

---

## 2.2 actions

<!-- _class: smalltext -->

```js
import { action } from 'mobx-miniprogram'

// TODO-7: 加入购物车。已存在则数量 +1（不超过 stock），否则新增并默认勾选
add: action(function (goods) { }),

// TODO-8: 设置数量。范围 [1, stock]，超出取边界值
setQty: action(function (id, qty) { }),

// TODO-9: 勾选/取消单项
toggle: action(function (id) { }),

// TODO-10: 全选/全不选
toggleAll: action(function (checked) { }),

// TODO-11: 删除单项
remove: action(function (id) { }),

// TODO-12: 清空已勾选项（结算后调用）
clearChecked: action(function () { }),

// TODO-13: 从持久化数据恢复（用于启动时）
hydrate: action(function (items) { })
```

---

## 2.3 action 的三个要求

<!-- _class: smalltext -->

1. **校验在 action 里**，不在页面里：

```js
// ✗ 页面里判断
if (qty > 0 && qty <= item.stock) cartStore.setQty(id, qty)
// ✓ action 内部保证不变量
setQty: action(function (id, qty) {
  const it = this.items.find(x => x.id === id)
  if (!it) return
  it.qty = Math.max(1, Math.min(it.stock, Math.floor(qty) || 1))
})
```

2. **一个 action 内多次修改只通知一次**，所以不要拆成多个 action 串调；

3. **直接改 store 字段是被允许的，但禁止这么做**——
   在报告里给出一个例子说明"绕过 action 会失去什么"。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：绑定到页面与组件

---

## 3.1 购物车页

<!-- _class: smalltext -->

```js
// pages/cart/cart.js
import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { cartStore } from '../../stores/cart'

ComponentWithStore({
  storeBindings: {
    store: cartStore,
    // TODO-14: 只绑渲染真正需要的字段
    fields: ['viewList', 'count', 'totalText', 'allChecked'],
    actions: ['setQty', 'toggle', 'toggleAll', 'remove', 'clearChecked']
  },
  methods: {
    onStep(e) { this.setQty(e.currentTarget.dataset.id, e.detail.value) },
    onToggle(e) { this.toggle(e.currentTarget.dataset.id) },
    onToggleAll() { this.toggleAll(!this.data.allChecked) },
    async onRemove(e) {
      const { confirm } = await wx.showModal({ title: '确认删除？' })
      if (confirm) this.remove(e.currentTarget.dataset.id)
    },
    onCheckout() { /* TODO-15: 校验有勾选项，跳转结算页 */ }
  }
})
```

---

## 3.2 用 behavior 共享用户态

<!-- _class: smalltext -->

`pages/goods` 和 `pages/mine` 都需要显示购物车件数，抽成 behavior：

```js
// behaviors/with-cart.js
import { BehaviorWithStore } from 'mobx-miniprogram-bindings'
import { cartStore } from '../stores/cart'

module.exports = BehaviorWithStore({
  storeBindings: {
    store: cartStore,
    fields: ['count', 'totalText'],
    actions: ['add']
  }
})
```

```js
// pages/goods/goods.js
Component({
  behaviors: [require('../../behaviors/with-cart')],
  methods: {
    onAdd(e) {
      this.add(e.currentTarget.dataset.goods)
      wx.showToast({ title: '已加入', icon: 'success' })
    }
  }
})
```

---

## 3.3 跨页同步验证

<!-- _class: smalltext -->

**必做的验证步骤**（截图记录）：

1. 在**商品页**加入 3 件商品 → 观察本页角标变为 3；
2. **不做任何刷新操作**，切到**我的**页 → 件数应已是 3；
3. 切到**购物车**页，把某项数量改成 5 → 立即切回**我的**页，总价应已更新；
4. 在购物车页删除全部 → 商品页角标应变为 0。

<br>

**必答**：如果用 `globalData` + `onShow` 手动同步，
上述哪一步会失败？为什么？（在报告里给出对照实现的伪代码）

---

## 3.4 fields 的性能验证

<!-- _class: smalltext -->

做一组对照：

| 绑定方式 | setData 字节数 | 说明 |
|---|---|---|
| `fields: ['items']` | | 直接绑原始数组 |
| `fields: ['viewList']` | | 绑裁剪 + 预格式化后的 |

<br>

**测量方法**：包一层 `setData` 打点。

```js
// TODO-16: 在页面里劫持 setData 统计字节数
const origin = this.setData.bind(this)
this.setData = (data, cb) => {
  const size = JSON.stringify(data).length
  console.log('[setData]', size, 'bytes', Object.keys(data))
  return origin(data, cb)
}
```

用 **100 件商品**的购物车测量，记录两组数据与倍数关系。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：持久化与角标

---

## 4.1 持久化

<!-- _class: smalltext -->

**文件**：`stores/persist.js`

```js
import { autorun } from 'mobx-miniprogram'

export function persist(store, key, fields, { debounce = 300 } = {}) {
  // TODO-17: 启动时恢复
  //   注意：恢复要走 action（hydrate），不能直接赋值

  // TODO-18: 变化时保存
  //   注意 1：autorun 里必须「访问」到字段才会被追踪
  //   注意 2：要去抖，否则连续改数量会疯狂写盘
  //   注意 3：observable 对象不能直接 setStorage，需要转成普通对象
}
```

```js
// app.js
import { cartStore } from './stores/cart'
import { persist } from './stores/persist'

App({
  onLaunch() { persist(cartStore, 'cart:items', ['items']) }
})
```

---

## 4.2 持久化的三个陷阱

<!-- _class: smalltext -->

**① 追踪失效**

```js
// ✗ autorun 里没访问字段，永远不会被触发第二次
autorun(() => { wx.setStorage({ key, data: store.items }) })   // 其实这个是对的
autorun(() => { save(store) })                                  // ✗ 没访问具体字段
```

**② observable 无法序列化**

```js
// ✗ 直接存会报错或存进代理对象
wx.setStorageSync(key, store.items)
// ✓ 转成纯对象
wx.setStorageSync(key, JSON.parse(JSON.stringify(store.items)))
```

**③ 恢复时数据过期**

商品可能已下架、价格已变。**恢复后要校验**：

```js
// TODO-19: hydrate 后调接口校验商品有效性，失效项标记为「已失效」而不是静默删除
```

---

## 4.3 TabBar 角标

<!-- _class: smalltext -->

```js
// app.js
import { reaction } from 'mobx-miniprogram'

App({
  onLaunch() {
    // TODO-20: 用 reaction 而不是 autorun，只在 count 变化时更新角标
    reaction(
      () => cartStore.count,
      count => {
        if (count > 0) {
          wx.setTabBarBadge({ index: 1, text: count > 99 ? '99+' : String(count) })
        } else {
          wx.removeTabBarBadge({ index: 1 })
        }
      },
      { fireImmediately: true }
    )
  }
})
```

<br>

**必答**：这里为什么用 `reaction` 而不是 `autorun`？
如果用 `autorun` 并在里面访问了 `totalText`，会多出什么开销？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：Store 单元测试

---

## 5.1 配置

```bash
npm i -D jest
```

```js
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/stores'],
  testMatch: ['**/__tests__/**/*.test.js']
}
```

<br>

**关键**：`stores/cart.js` **不能 import 任何 `wx.*` 相关的东西**，
否则这里就跑不起来。这是本任务的核心验证点。

---

## 5.2 必写的测试用例

<!-- _class: tinytext -->

```js
// stores/__tests__/cart.test.js
import { cartStore } from '../cart'

const G = (id, price = 1000, stock = 10) =>
  ({ id, title: 'G' + id, priceInCent: price, stock })

beforeEach(() => { cartStore.hydrate([]) })

describe('add', () => {
  test('TODO-21: 新商品加入后数量为 1 且默认勾选', () => {})
  test('TODO-22: 重复加入同一商品数量累加', () => {})
  test('TODO-23: 数量不超过 stock', () => {})
})

describe('setQty', () => {
  test('TODO-24: 数量下限为 1', () => {})
  test('TODO-25: 数量上限为 stock', () => {})
  test('TODO-26: 传入小数向下取整', () => {})
  test('TODO-27: 对不存在的 id 无副作用', () => {})
})

describe('computed', () => {
  test('TODO-28: totalInCent 只统计勾选项', () => {})
  test('TODO-29: totalText 格式为 ￥xx.xx', () => {})
  test('TODO-30: 空购物车时 allChecked 为 false', () => {})
  test('TODO-31: viewList 不包含 stock/cover 字段', () => {})
})

describe('金额精度', () => {
  test('TODO-32: 0.1 + 0.2 类问题不出现（3 件 33 分应为 99 分）', () => {})
})
```

---

## 5.3 覆盖率

```bash
npx jest --coverage
```

要求：`stores/cart.js` 的**行覆盖率 ≥ 90%**，**分支覆盖率 ≥ 80%**。

<br>

**如果覆盖率上不去**，通常说明：

- 有些分支是防御性的、永远走不到 → 考虑删掉或改成断言；
- 有些逻辑耦合了外部依赖 → 说明分层没做干净。

**在报告里贴出覆盖率报告截图**，并说明未覆盖的分支为什么可以接受。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 功能验收清单

<!-- _class: smalltext -->

- [ ] 商品页加入购物车，TabBar 角标立即更新
- [ ] 三个页面的件数/总价始终一致，**无需手动刷新**
- [ ] 数量步进器在 1 和 stock 处正确卡住
- [ ] 全选/取消全选正确联动单项勾选
- [ ] 只有勾选项计入总价
- [ ] 删除弹确认框，取消则不删
- [ ] 杀掉小程序重进，购物车内容仍在
- [ ] 结算后已勾选项被清空，未勾选项保留
- [ ] 100 件商品时 `setData` 字节数明显小于绑 `items` 的版本
- [ ] `npx jest` 全部通过，覆盖率达标

---

## 6.2 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 32 个 TODO 全部补全 | 20 |
| 2 | 功能验收清单全部通过 | 20 |
| 3 | `viewList` 裁剪有效，两组 setData 字节数对比完整 | 15 |
| 4 | 持久化正确（含 observable 序列化、去抖、失效校验） | 10 |
| 5 | 角标用 `reaction` 且能解释与 `autorun` 的区别 | 5 |
| 6 | Jest 全部通过，覆盖率达标并有截图 | 20 |
| 7 | `globalData` 对照分析、绕过 action 的代价分析 | 10 |

---

## 6.3 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| `import` 报错找不到 mobx | 没构建 npm 或没勾选使用 npm 模块 | 重新构建 |
| 改了 store 界面不动 | 改的是普通对象副本，不是 observable | 确认改的是 `store.items[i]` |
| `computed` 每次都重算 | 依赖了非 observable 的外部变量 | 检查 getter 里访问了什么 |
| Jest 报 `wx is not defined` | store 里引了小程序 API | 把 API 调用移到 service 层 |
| Storage 里存的是 `{}` | observable 代理无法直接序列化 | `JSON.parse(JSON.stringify(x))` |
| 角标数字不更新 | tabBar index 写错 | 核对 `app.json` 的 tabBar 顺序 |
| 连续点步进器卡顿 | 每次都写 Storage | 加去抖 |

---

## 6.4 拓展（选做，加分）

1. 加一个 `orderStore` 管理"选地址 → 选优惠券 → 确认"的多步流程，
   说明哪些状态进 store、哪些留在页面；
2. 实现**乐观更新**：加购时先改本地，接口失败再回滚，并给出并发点击的处理；
3. 用 `autorun` 把 store 的每次变更写入一个**变更日志**（时间、action 名、前后快照），
   实现简易的"时间旅行"调试；
4. 实现**多设备合并**：本地购物车与服务端购物车冲突时，
   设计并实现一套合并策略（数量取大？取和？以服务端为准？说明理由）。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验五 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
