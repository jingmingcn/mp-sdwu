# code-04 · 发布一个 npm 组件包

对应 `lab-04.md`、理论 `ch-04.md`。

## 目录

```
code-04/
├── sdwu-ui/          # 组件包（要发布的东西）
│   ├── package.json  # 关键：miniprogram 字段
│   ├── src/          # 源码
│   ├── miniprogram_dist/   # 构建产物（由 tools/build.js 生成）
│   └── tools/build.js
└── demo/             # 使用方小程序 —— 用开发者工具导入这个目录
```

## 运行

```bash
cd sdwu-ui && npm install && npm run build
cd ../demo && npm install
```

然后：开发者工具 → 导入项目 → 选择 **`demo/`** 目录
→ 工具 → 构建 npm → 勾选「使用 npm 模块」。

### 两种本地联调方式

**方式 A：npm pack（推荐，更稳）**

```bash
cd sdwu-ui && npm run build && npm pack
cd ../demo && npm i ../sdwu-ui/sdwu-ui-1.0.0.tgz
```

**方式 B：npm link（改代码立即生效，但工具监听不稳）**

```bash
cd sdwu-ui && npm link
cd ../demo && npm link sdwu-ui
```

两种方式都要在开发者工具里**重新执行「构建 npm」**。

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| TODO-1 | `sdwu-ui/src/tabs/index.js` | relations 的三个回调 |
| TODO-2 | `sdwu-ui/src/tabs/index.js` | `syncTabs()` 从关联节点读信息 |
| TODO-3 | `sdwu-ui/src/tabs/index.js` | `activate(index)` |
| TODO-4 | `sdwu-ui/src/tabs/index.js` | `onTitleTap` 跳过 disabled |
| TODO-5 | `sdwu-ui/src/tab/index.js` | `setActive` —— 首次激活后改 hidden |
| TODO-6 | `sdwu-ui/src/tabs/index.js` | `export()` 收窄 API（已给出参考） |
| TODO-7 | `demo/pages/demo/demo.js` | 验证封装边界（已给出参考） |
| TODO-8 | `sdwu-ui/tools/build.js` | 构建 + **完整性校验** |

## 必做实验

1. 把 `sdwu-ui/package.json` 里的 `"miniprogram": "miniprogram_dist"` **删掉**，
   重新构建 npm，记录 `.wxml` 会怎样；
2. 对比 `npm pack` 与 `npm link` 两种联调方式的生效速度；
3. 在 demo 里对比三种组件注册方式的主包体积与启动耗时：
   - 全局注册 + 不开 `lazyCodeLoading`
   - 全局注册 + 开启 `lazyCodeLoading`
   - 页面级注册
