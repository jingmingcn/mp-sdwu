# code-06 · 带拦截器的请求库

对应 `lab-06.md`、理论 `ch-06.md`。

## 运行

**先启动 Mock 服务器**（零依赖，无需 npm install）：

```bash
node server/index.js
```

然后导入小程序项目，**开发者工具需勾选「不校验合法域名」**
（详情 → 本地设置）。

## 结构

```
request/
├── index.js         # http 实例 + dispatch 链
├── setup.js         # 拦截器注册（大部分 TODO 在这里）
├── interceptor.js   # InterceptorManager
├── adapter.js       # 包装 wx.request
├── error.js         # ApiError
├── retry.js         # 指数退避
├── queue.js         # 并发限流
├── dedupe.js        # 请求去重
└── signal.js        # 取消
```

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| 1~3 | `interceptor.js` | use / eject / forEach |
| 4 | `index.js` | 组装 Promise 链 |
| 5~7 | `setup.js` | token / loading / 响应归一 |
| 8~10 | `error.js` | ApiError 字段 / isRetryable / userMessage |
| 11 | `setup.js` | 重试拦截器 |
| 12~13 | `setup.js` | 401 刷新与并发合并 |
| 14~15 | `queue.js` | 并发队列 |
| 16~17 | `dedupe.js` | 去重 |
| 18~19 | `signal.js` | 取消 |
| 20~21 | `pages/search/search.js` | 竞态（已给出框架） |
| 22~25 | `utils/storage.js` | TTL / 过期清理 / 超限重试 |
| 26~29 | `services/cache.js` | 三种缓存策略 |

## Mock 服务器路由

| 路由 | 行为 |
|---|---|
| `GET /goods?page=1` | 正常列表 |
| `GET /slow?ms=3000` | 延迟指定毫秒 |
| `GET /flaky?rate=0.5` | 按概率返回 500 |
| `GET /biz-error` | HTTP 200 但 `code !== 0` |
| `GET /secure` | 需要有效 token，否则 401 |
| `POST /auth/login` | 用 code 换 token，**日志会打印第几次登录** |
| `POST /debug/expire-token` | 让当前 token 立即失效 |
| `POST /debug/reset` | 重置登录计数 |
| `GET /search?kw=` | **关键词越短返回越慢** —— 专门暴露竞态 |

## 关键验证（都要截图）

1. 并发 5 个请求，`showLoading` **只调用一次**
2. 六种错误的 `err.type` 分辨表
3. 并发 6 个 401 请求 → 服务器日志 `/auth/login` **只出现 1 次**
4. 3 个相同 GET → 服务器日志 **只有 1 条**
5. 竞态四种模式的最终结果对比
