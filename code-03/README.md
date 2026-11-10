# code-03 · 可复用星级评分组件

对应 `lab-03.md`、理论 `ch-03.md`。

## 运行

导入项目即可，无 npm 依赖。

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| TODO-1 | `components/star-rating/index.wxml` | 两层 view 叠加实现半星 |
| TODO-2 | `components/star-rating/index.js` | `onTap` —— 半星判定 |
| TODO-3 | `components/star-rating/index.js` | `commit` —— 受控/非受控分叉 |
| TODO-5 | `components/star-rating/index.js` | `observers` 派生 current/stars/text |
| TODO-6 | `components/star-rating/index.js` | `attached` 里初始化 `_inner` |
| TODO-8 | `components/star-rating/index.wxss` | CSS 变量着色 |
| TODO-9 | `behaviors/interactive.js` | `canInteract()` |

（TODO-4 / 7 是设计判断题，见 lab-03 的对应页）

## 核心公式

第 i 颗星的填充比例：

```
ratio[i] = clamp(current - i, 0, 1)
```

这一个公式同时支持整星、半星、任意小数比例。
**不要**写 `if (allowHalf) ... else ...` 的两套分支。

## 验收要点

- 演示页第 ③ 项（受控 + 父级拒绝更新）点击后**必须纹丝不动**
- `defaultValue=3` 时**首次渲染**就显示 3 星，不需要点一下才出现
- 第 ⑧ 项的 flex 行不能被组件破坏（验证 `virtualHost`）
- 模板里**不允许出现任何计算表达式**

## 组件文档

见 `components/star-rating/README.md` —— 没有 README 的组件视为未完成。
