# code-12 · 测试、CI 与发布运维

对应 `lab-12.md`、理论 `ch-12.md`。

## 运行

```bash
npm install
```

```bash
npm run ci:local
```

`ci:local` 等价于整条流水线：`lint` → `test:cov` → `size`。
**开箱即绿**，你的任务是在此基础上补齐 TODO 并让它保持绿。

| 命令 | 说明 |
|---|---|
| `npm run lint` | ESLint + 项目自定义检查 |
| `npm test` | Jest 单测 + 组件测试 |
| `npm run test:cov` | 带覆盖率（不达标会失败） |
| `npm run test:e2e` | UI 自动化（需开发者工具，慢） |
| `npm run size` | 体积红线 |
| `npm run upload` | miniprogram-ci 上传体验版 |
| `npm run format` | Prettier 格式化 |

小程序工程在 `miniprogram/`，用开发者工具导入**那个目录**。

## 结构

```
code-12/
├── miniprogram/          # 小程序源码（导入这个目录）
│   ├── utils/            # 纯函数，可直接单测
│   ├── stores/           # 状态层，不依赖 wx.*
│   ├── services/         # 业务数据访问
│   ├── request/          # HTTP 工具
│   └── components/star-rating/
├── tests/
│   ├── setup.js          # 挂全局变量（setupFiles）
│   ├── setup-after-env.js# beforeEach 等钩子（setupFilesAfterEnv）
│   ├── mocks/wx.js       # wx API 的 Mock
│   ├── unit/             # 单元测试（70%）
│   ├── component/        # 组件测试（20%）
│   └── e2e/              # UI 自动化（10%）
├── scripts/
│   ├── upload.js         # miniprogram-ci 上传
│   ├── check-size.js     # 体积红线
│   └── lint-setdata.js   # 项目自定义检查
└── .github/workflows/ci.yml
```

## 三个必须知道的坑

**① `setupFiles` 里不能用 `beforeEach`**

`setupFiles` 在测试框架安装**之前**执行，只能挂全局变量。
钩子要放 `setupFilesAfterEnv`（本项目已拆成两个文件）。

**② `miniprogram-simulate` 的 `dispatchEvent` 是异步的**

内部用 `Promise.resolve().then(...)` 模拟真实事件时序。
派发事件后**必须** `await simulate.sleep(0)`，否则断言拿到的是旧状态。

```js
comp.querySelectorAll('.star')[2].dispatchEvent('tap')
await simulate.sleep(0)          // ← 少了这行，测试必挂
expect(...)
```

**③ ESLint 不要用 `env: node`**

小程序逻辑层不是 Node 也不是浏览器。
用 `env: node` 会把 `process` / `fs` 也放进来 —— 那是在骗自己。
本项目在 `globals` 里逐个声明了逻辑层真正提供的能力。

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| 1 | `.eslintrc.js` | 补全规则（≥5 条，说明理由） |
| 2 | `scripts/lint-setdata.js` | 自定义检查（≥5 条 + fixtures） |
| 3~4 | `.husky/pre-commit` `pre-push` | 已给出，验证拦截效果并截图 |
| 5 | `tests/mocks/wx.js` | 补全 Mock |
| 6~11 | `tests/unit/*.test.js` | 六个模块的单测（已给出示例，需扩展） |
| 12~15 | `tests/component/star-rating.test.js` | 组件测试（已给出可跑版本） |
| 16~18 | `tests/e2e/checkout.test.js` | UI 自动化三个场景 |
| 19~20 | `scripts/upload.js` | 上传脚本 + 体积红线 |
| 21 | `.github/workflows/ci.yml` | 流水线 |
| 22 | 报告 | 三个 CI 踩坑记录 |
| 23 | 报告 | 发布 SOP（≥15 项，含回滚预案） |
| 24~25 | `miniprogram/utils/report.js` `app.js` | 批量上报 + 三个全局钩子 |
| 26~27 | `miniprogram/utils/logger.js` | 实时日志 + trace |
| 28~29 | `miniprogram/app.js` | Performance 采集与统计表 |
| 30~31 | `miniprogram/services/feature.js` | 功能开关 + 降级演练 |

## 覆盖率

`jest.config.js` 里配了 `coverageThreshold`（行 80% / 分支 70% / 函数 80%），
**不达标会让 `npm run test:cov` 返回非 0，CI 随之失败**。

`report.js` / `logger.js` / `feature.js` 目前被排除在统计外
（它们还是 TODO）。**补完实现与测试后必须把排除行删掉。**

## 上传密钥安全

`private.*.key` 与 `.env` 已在 `.gitignore` 中。

**若不慎提交，立即在 MP 后台重置密钥** —— 泄漏等于交出发布权限。
