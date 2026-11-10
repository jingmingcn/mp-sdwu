# code-05 · MobX 购物车

对应 `lab-05.md`、理论 `ch-05.md`。

## 运行

```bash
npm install
```

导入项目 → **工具 → 构建 npm** → 详情 → 本地设置 → 勾选 **使用 npm 模块**。

单元测试（**不需要开发者工具，直接在终端跑**）：

```bash
npm test
```

```bash
npm run test:cov
```

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| TODO-1~6 | `stores/cart.js` | 六个 computed，重点是 `viewList` |
| TODO-7~13 | `stores/cart.js` | 七个 action，校验写在 action 里 |
| TODO-14 | `pages/cart/cart.js` | `fields` 只绑渲染需要的 |
| TODO-15 | `pages/cart/cart.js` | 结算校验 |
| TODO-16 | `pages/cart/cart.js` | 劫持 setData 统计字节（已给出参考） |
| TODO-17~19 | `stores/persist.js` | 恢复 / 保存 / 失效校验 |
| TODO-20 | `app.js` | TabBar 角标（已给出参考） |
| TODO-21~32 | `stores/__tests__/cart.test.js` | 12 组测试 |

## 三条铁律

1. **金额全程用整数分**，只在渲染前一刻转「元」字符串
2. **action 是唯一写入口**，校验写在 action 里
3. **`stores/` 不 import 任何 `wx.*`** —— 否则 `npm test` 直接报 `wx is not defined`

## 关键对比实验

用 **100 件商品**的购物车，对比两种绑定：

| 绑定 | setData 字节数 |
|---|---|
| `fields: ['items']` | ? |
| `fields: ['viewList']` | ? |

控制台会打印每次 setData 的字节数（TODO-16 的劫持）。

## 跨页同步验证

1. 商品页加 3 件 → 本页角标变 3
2. **不刷新**切到「我的」→ 件数已是 3
3. 购物车改数量 → 立即切回「我的」→ 总价已更新
4. 购物车清空 → 商品页件数变 0

必答：如果用 `globalData` + `onShow` 手动同步，上述哪一步会失败？
