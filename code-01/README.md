# code-01 · 运行机制观测与工程骨架

对应 `lab-01.md`、理论 `ch-01.md`。

## 运行

```bash
npm install
```

1. 微信开发者工具 → 导入项目 → 选择本目录
2. AppID 用测试号即可
3. 工具 → 构建 npm
4. 详情 → 本地设置 → 勾选「使用 npm 模块」

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| TODO-1 | `config/index.js` | 补全 trial / release 配置 |
| TODO-2 | `utils/logger.js` | 实现 `stamp()`，返回 `[+123ms]` |
| TODO-3 | `utils/logger.js` | 实现 `log()`，DEBUG 为假时静默 |
| TODO-4 | `pages/lifecycle/lifecycle.js` | `onLoad` 里查询节点，观察结果 |
| TODO-5 | `pages/lifecycle/lifecycle.js` | `onReady` 里查询节点，对比 |
| TODO-6 | `pages/lifecycle/lifecycle.js` | 注释掉 `clearInterval` 复现错误 |
| TODO-7 | `pages/bench/bench.js` | 补全 C / D / E 三组用例 |
| TODO-8 | `pages/index/index.js` | 逐项探测工具与真机的差异 |

## 产出

- 四个场景的生命周期时序表
- 六组基准测试数据（工具 + 真机各一份）
- 三条基于自己数据的结论
- 至少两处工具/真机差异，含跨端安全的日期写法

## 提示

- 性能测试用「预览」或「体验版」，**不要**用「真机调试」
- `utils/format.js` 里的 `parseDate` 就是跨端安全的日期解析参考实现
