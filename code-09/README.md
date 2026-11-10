# code-09 · 性能优化实战

对应 `lab-09.md`、理论 `ch-09.md`。

**本工程是故意写差的。** 你的任务是把它优化到达标，
并且**每一步都有 before/after 数据**。

## 已知问题（逐一找出并修复）

| # | 问题 | 位置 |
|---|---|---|
| 1 | 12 张约 100KB 的图片放在代码包里（合计 1.2MB） | `images/` |
| 2 | `app.js` 顶层 require 360KB 城市 JSON | `app.js` / `config/all-cities.js` |
| 3 | `onLaunch` 里串行 await 四个初始化 | `app.js` |
| 4 | 全量引入 lodash / moment | `utils/legacy.js` |
| 5 | 没有分包，页面全在主包 | `app.json` |
| 6 | 首页一次 setData 传 2000 条含冗余字段 | `pages/index` |
| 7 | 滚动时每帧 setData | `pages/index` |
| 8 | 图片没尺寸参数、没 lazy-load | `pages/index` |
| 9 | 详情页跳转前 await 接口 | `pages/index` |
| 10 | 没有骨架屏、没有缓存 | 全局 |

## 顺序（不要跳步）

**第一步永远是建立基线。** 动任何代码之前，先记录 8 项指标，
同一台真机、同一网络、冷启动 3 次取中位数。

```bash
npm install
```

## 目标

| 指标 | 目标 |
|---|---|
| 主包大小 | < 1.2MB |
| 总包大小 | < 4MB |
| 冷启动耗时 | < 2s |
| 首屏时间 | < 1.5s |
| 二次进入首屏 | < 300ms |
| 首屏 setData 字节 | < 64KB |
| 列表节点数 | < 200 |
| 滚动 FPS（最低） | > 50 |
| 内存峰值 | < 200MB |

## 度量工具

- `utils/perf.js` —— mark / measure
- `utils/setdata-monitor.js` —— 劫持 setData 统计次数与字节数
- 真机性能面板 —— FPS、内存（**唯一可信的数据源**）
- 开发者工具 → 详情 → 基本信息 → 代码依赖分析 —— 包体积

## TODO 清单

25 个 TODO 分布在各文件中，用 `TODO-` 搜索。
每个 TODO 都对应 `lab-09.md` 里的一个小节。
