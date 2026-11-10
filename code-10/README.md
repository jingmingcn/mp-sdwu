# code-10 · Canvas 海报与 WebView 互通

对应 `lab-10.md`、理论 `ch-10.md`。

## 运行

小程序：导入本目录（`code-10/`），勾选「不校验合法域名」。

H5（任务三需要）：

```bash
node h5/server.js
```

## 页面

| 页面 | 任务 |
|---|---|
| `pages/poster/poster` | 任务一：Canvas 2D 海报 |
| `pages/native/native` | 任务二：同层渲染验证 |
| `pages/feed/feed` | 任务二：单例 video 对比 |
| `pages/webview/webview` | 任务三：web-view 互通 |
| `cross/` | 任务四：跨端选型（见该目录 README） |

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| 1~3 | `utils/canvas.js` | getCtx（DPR）/ loadImage / loadRemote |
| 4~5 | `utils/canvas.js` | ellipsis / wrapText（中英混排） |
| 6~9 | `services/poster.js` | drawPoster / 保存相册 / 离屏对比 |
| 10 | `pages/native/native` | 同层渲染验证表（双端） |
| 11~13 | `pages/feed/feed.js` | 每项一个 video vs 单例 video |
| 14~16 | `h5/index.html` | getEnv / postMessage / navigateTo |
| 17 | `pages/webview/webview.js` | postMessage 时机实验 |
| 18~19 | `pages/webview/webview.js` | 登录态传递（URL vs ticket） |
| 20 | `pages/webview/webview.js` | web-view 限制验证表 |
| 21~22 | `cross/` | 跨端实测与开发体验对比 |

## 三个最容易踩的坑

1. **海报模糊** —— 没按 `pixelRatio` 放大 canvas
2. **海报空白** —— canvas 用了 `display: none`（要用绝对定位移出屏幕）
3. **`ctx.clip()` 后面全没了** —— 忘了 `restore()`
