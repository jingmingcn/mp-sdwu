# code-08 · 分享、订阅消息与小程序码

对应 `lab-08.md`、理论 `ch-08.md`。

## 结构

```
code-08/
├── miniprogram/     # 用开发者工具导入这个目录
└── server/          # Mock 服务端（零依赖）
```

## 运行

```bash
node server/index.js
```

导入 `miniprogram/`，勾选「不校验合法域名」。

## 关于主体资质

| 能力 | 个人主体 | 本实验做法 |
|---|---|---|
| 转发 / 朋友圈分享 | ✓ | **真实实现** |
| 场景值 / 启动参数 | ✓ | **真实实现** |
| 小程序码 | 需 access_token | 服务端 Mock，返回结构一致 |
| 订阅消息 | 模板需申请 | 客户端真实请求，服务端推送 Mock |
| 获取手机号 | ✗ | 仅 Mock，理解流程 |

**没有企业主体不影响完成本实验。**

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| 1~4 | `pages/goods/detail.js` | onShareAppMessage / onShareTimeline |
| 5~6 | `utils/attribution.js` | parseEntry / setEntryContext |
| 7 | `pages/goods/detail.js` | 单页模式适配（已给出框架） |
| 8~11 | `pages/order/success.js` | 订阅请求 / 结果解析 / 引导设置 |
| 12~14 | `server/index.js` | 余额管理与推送（服务端侧） |
| 15 | `server/tmpl-validate.js` | 模板字段格式校验 |
| 16~18 | `server/index.js` + `pages/qrcode` | 短 key 映射与解析 |
| 19 | `pages/index/index.js` | 场景值分流 |
| 20~22 | `utils/capability.js` | withFallback / reportDegrade / ensureScope |

## 必做实验

1. **归因表**：真机上用五种方式打开，记录 `scene` 与 `query`
2. **订阅时机对照**：首页弹 vs 下单成功页弹，≥5 人样本，算通过率
3. **超长 scene**：直接传 → 记录错误原文；改短 key → 成功
4. **降级验证表**：四个能力 × 三种状态（正常/拒绝/不可用）
