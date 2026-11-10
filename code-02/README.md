# code-02 · WXS 与渲染性能实战

对应 `lab-02.md`、理论 `ch-02.md`。

## 运行

导入项目即可，本实验无 npm 依赖。**所有结论必须来自真机。**

## 页面

| 页面 | 任务 |
|---|---|
| `pages/format/format` | 任务一：三种格式化方案对照 |
| `pages/key/key` | 任务二：`wx:key` 对照实验 |
| `pages/swipe/swipe` | 任务三/四：左滑删除 + FPS 对比 |

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| TODO-1~4 | `utils/fmt.wxs` | price / ellipsis / time / stockClass |
| TODO-5~8 | `pages/key/key.js` | prepend / reverse / removeSecond / measure |
| TODO-9~10 | `pages/swipe/swipe.js` | 逻辑层版 touchmove / touchend |
| TODO-11~14 | `utils/swipe.wxs` | WXS 版 touchmove / touchend / px 换算 |
| TODO-15 | `pages/swipe/swipe.js` | 制造逻辑层繁忙（已给出参考实现） |

## WXS 写之前先记住

```js
// ✗ 不支持
const / let / 箭头函数 / 模板字符串 / class / 展开运算符
new Date() / JSON / wx.* / padStart / includes / Array.from

// ✓ 用这些替代
var / function / '+' 拼接 / getDate() / indexOf() >= 0
```

WXS 无法打断点。调试时把中间值 `return` 出来渲染，或用 `ins.callMethod` 抛回逻辑层。

## 测量

- FPS：真机 → 摇一摇 → 打开性能监控
- setData 字节数：`JSON.stringify(payload).length`
- 节点数：`wx.createSelectorQuery().selectAll('*')`
