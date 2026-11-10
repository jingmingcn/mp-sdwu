# 本地模拟层（无法开通云开发时使用）

若确实无法开通云开发（例如没有可用的 AppID），
这里提供一套**接口签名完全一致**的本地模拟层，
可完成除**云调用**外的全部任务。

## 用法

在 `app.js` 的 `wx.cloud.init` 之前插入：

```js
if (!wx.cloud || USE_LOCAL_MOCK) {
  require('./local-mock/install')()   // 用内存实现替换 wx.cloud
}
```

## 覆盖范围

| 能力 | 模拟 | 说明 |
|---|---|---|
| `wx.cloud.database()` | ✓ | 内存集合，支持 where/orderBy/limit/skip/count/update/remove |
| `wx.cloud.callFunction` | ✓ | 直接在小程序里跑云函数的 handler（注入假的 getWXContext） |
| `wx.cloud.uploadFile` | ✓ | 存到 `wx.env.USER_DATA_PATH` |
| `db.runTransaction` | ⚠ | 顺序执行，**没有真正的原子性** —— 事务对照实验做不了 |
| `cloud.openapi.*` | ✗ | 云调用无法模拟，相关任务请改用截图 + 文字说明 |

## 报告要求

使用模拟层的同学，必须在报告开头说明：
1. 为什么无法开通云开发；
2. 哪些任务用了模拟层；
3. 模拟层与真实云开发在行为上的差异（至少 3 条）。
