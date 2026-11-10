# code-11 · 云开发留言板

对应 `lab-11.md`、理论 `ch-11.md`。

## 前置条件

**本实验需要真实 AppID**（测试号不支持云开发）。

1. 注册个人小程序（免费，微信公众平台）
2. 开发者工具 → 云开发 → 开通（有免费额度）
3. 创建两个环境：`dev-xxx` 与 `prod-xxx`
4. 把环境 ID 填进 `config/cloud.js`

```bash
cd cloudfunctions/message && npm install
cd ../cleanup && npm install
cd ../seed && npm install
```

云函数需要**逐个右键上传并部署**（云函数目录右键 → 上传并部署：云端安装依赖）。

> 无法开通云开发时，见 `local-mock/README.md`。

## 数据模型

```js
// messages
{ _id, _openid, content, images: ['cloud://...'], authorName, authorAvatar,
  likeCount, commentCount, status: 'pending'|'published'|'rejected',
  createdAt, updatedAt }

// likes —— 用独立集合而不是 messages 里的数组
{ _id, _openid, messageId, createdAt }

// comments
{ _id, _openid, messageId, content, authorName, status, createdAt }
```

**必答**：为什么点赞不用 `messages.likedBy: []` 数组？（至少两个理由）

## 权限设置（在云开发控制台配置）

| 集合 | 建议权限 | 理由 |
|---|---|---|
| `messages` | 所有用户可读，仅创建者可写 | 列表公开，但只能改自己的 |
| `likes` | 仅管理端可读写 | 点赞必须走事务，前端不能直连 |
| `comments` | 所有用户可读，仅创建者可写 | 同 messages |
| `configs` | 所有用户可读，仅管理端可写 | 全局配置 |

**TODO-1**：填写并在报告里说明你的选择。

## 关键原则

1. **`cloud.getWXContext()` 是唯一可信的身份来源** —— 永远不要信 `event` 里的用户 ID
2. **初始化放在 handler 外面** —— 容器复用时只执行一次，省冷启动
3. **`createdAt` 用 `db.serverDate()`** —— 不要用 `new Date()`
4. **写上传逻辑的同时就写删除逻辑** —— 否则存储容量会持续增长
5. **必须建索引** —— 这是云开发最常见的性能问题来源

## TODO 清单

| # | 位置 | 说明 |
|---|---|---|
| 1~3 | 控制台 + 报告 | 权限设置 / 直连vs云函数判断 / 索引对比 |
| 4 | `services/message.js` | 两种分页对比 |
| 5 | `cloudfunctions/message/index.js` | 统一入口与错误处理 |
| 6~9 | `handlers/create.js` | 校验 / 频率限制 / 安全检测 / 写库 |
| 10 | `handlers/like.js` | **事务**保证一致性 |
| 11 | `cloudfunctions/message/index.js` | 冷启动测量（已给出参考） |
| 12~16 | `services/upload.js` | 压缩 / 上传 / 批量 / 缩略图 |
| 17 | `handlers/remove.js` | 删除即清理 |
| 18 | 控制台 + 报告 | 容量监控与流量估算 |
| 19~21 | `handlers/create.js` | 内容安全检测与状态流转 |
| 22 | `handlers/comment.js` | 订阅消息（云调用） |
| 23 | `cloudfunctions/cleanup/index.js` | 定时任务（幂等 + 分批） |
| 24 | `config/cloud.js` | 环境隔离 |

## 造测试数据

索引对比实验需要 5000 条。云函数单次最长 60 秒，所以分批调用：

```js
// 在开发者工具的云函数「本地调试」里，或写个临时按钮
wx.cloud.callFunction({ name: 'seed', data: { from: 0, count: 500 } })
```

清理：`wx.cloud.callFunction({ name: 'seed', data: { clean: true } })`

## 事务对照实验（本实验的核心）

1. 先写一个**不用事务**的 `like`
2. 并发调用 20 次点赞/取消
3. 检查 `likeCount` 与 `likes` 表实际条数是否一致
4. 改成事务版本，重复实验
5. **记录两次的数据差异**
