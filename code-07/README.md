# code-07 · 登录鉴权全链路

对应 `lab-07.md`、理论 `ch-07.md`。

## 结构

```
code-07/
├── miniprogram/       # 用开发者工具导入这个目录
└── server/            # Express 服务端（含 Mock 微信接口）
```

## 运行

```bash
cd server
npm install
cp .env.example .env
npm start
```

`MOCK_WX=true` 时不真的调微信接口，由 code 推导出稳定的 openid，
**本地即可完成全部实验，不需要真实 AppSecret**。

小程序端：导入 `miniprogram/` 目录，勾选「不校验合法域名」。

## 安全红线

- `.env` 已在 `.gitignore` 中，**提交作业时不要包含任何真实 AppSecret**
- `session_key` 只在服务端，**永远不出现在任何响应里**
- 所有涉及用户数据的接口用 `req.uid`，不用请求参数里的 uid

## TODO 清单

| # | 文件 | 说明 |
|---|---|---|
| 1 | `server/wx.js` | `code2Session`（含 Mock 分支） |
| 2~6 | `server/token.js` | 双令牌签发/校验/rotation/吊销 |
| 7~13 | `server/index.js` | 三个 auth 接口 + 鉴权中间件 + 三个业务接口 |
| 14~17 | `miniprogram/services/auth.js` | login / ensureLogin / logout / checkSession |
| 18 | `miniprogram/app.js` | 静默登录不阻塞首屏 |
| 19 | `miniprogram/request/setup.js` | 401 无感续期 |
| 20~21 | `miniprogram/behaviors/auth-required.js` | 页面鉴权 + 回跳记录 |
| 22 | `miniprogram/pages/login/login.js` | 登录后回跳 |
| 23~26 | `miniprogram/pages/attack/attack.js` | 四种攻击演练 |
| 27 | `miniprogram/utils/sign.js` | 接口签名（选做但推荐） |

## 攻防演练要点

每种攻击都要**攻击成功**与**防护成功**两份截图：

1. **越权访问** —— 服务端先故意用 `req.query.uid`，攻击成功后改回 `req.uid`
2. **篡改本地状态** —— 改 Storage 里的 `isAdmin`，前端按钮出现但服务端拒绝
3. **伪造 token** —— 改 JWT payload 不改签名，服务端能识破
4. **重放** —— 连续调 20 次签到，加幂等/限流/签名后防住
