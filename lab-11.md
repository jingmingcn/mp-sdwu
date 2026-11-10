---
marp: true
size: 16:9
theme: am_blue
paginate: true
math: katex
footer: \ *张丽，井明（数据科学与计算机学院）* *移动端小程序开发（miniprogram）* *2026年秋*
---

<!-- _class: cover_e -->
<!-- _paginate: "" -->
<!-- _footer: ![](./images/logo_transparent.png) -->
<!-- _header: ![](./images/logo-1_transparent.png) -->

# 实验十一 云开发留言板

###### “借云之力，专注于事。”

张丽，井明
数据科学与计算机学院
jingming@sdu.edu.cn
2026年秋

---

<!-- _header: 目录<br>CONTENTS<br>![](images/logo-1_transparent.png)-->
<!-- _class: toc_b -->
<!-- _footer: "" -->
<!-- _paginate: "" -->

- 实验目标与准备
- 任务一：数据库与权限
- 任务二：云函数
- 任务三：云存储
- 任务四：云调用与定时任务
- 验收与提交

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第一节 实验目标与准备

---

## 1.1 实验目标

实现一个带**图文留言、点赞、评论、内容审核**的留言板，全部基于云开发。

<br>

1. 设计云数据库集合与**权限模型**，理解 `_openid` 的作用；
2. 用云函数实现**必须服务端校验**的写操作，掌握 `getWXContext`；
3. 用云存储管理图片，实现**上传即压缩、删除即清理**；
4. 用**云调用**做内容安全检测与订阅消息，用**定时触发器**做数据清理。

> 对应 **第十一章**。配套代码：`code-11/`

---

## 1.2 准备

<!-- _class: smalltext -->

**本实验需要真实 AppID**（测试号不支持云开发）。

1. 注册个人小程序（免费，微信公众平台）；
2. 开发者工具 → 云开发 → 开通（有免费额度）；
3. 创建两个环境：`dev-xxx` 与 `prod-xxx`；
4. 把环境 ID 填进 `config/cloud.js`。

```bash
cd code-11 && npm install
cd cloudfunctions/message && npm install
```

```json
// project.config.json
{ "cloudfunctionRoot": "cloudfunctions/" }
```

> 若确实无法开通云开发，`code-11/local-mock/` 提供了一套本地模拟层，
> 接口签名完全一致，可完成除云调用外的全部任务。

---

## 1.3 数据模型

<!-- _class: smalltext -->

```js
// 集合：messages
{
  _id, _openid,                    // 自动
  content: '这是一条留言',
  images: ['cloud://...'],         // 最多 9 张
  authorName: '张三',
  authorAvatar: 'cloud://...',
  likeCount: 0,
  commentCount: 0,
  status: 'pending' | 'published' | 'rejected',   // 内容审核结果
  createdAt: Date,
  updatedAt: Date
}

// 集合：likes —— 用独立集合而不是数组，避免单文档 512KB 上限
{ _id, _openid, messageId, createdAt }

// 集合：comments
{ _id, _openid, messageId, content, authorName, status, createdAt }
```

**必答**：为什么点赞不用 `messages` 里的 `likedBy: []` 数组？列出两个理由。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第二节 任务一：数据库与权限

---

## 2.1 权限设置

<!-- _class: smalltext -->

在云开发控制台为每个集合设置权限，**并说明理由**：

| 集合 | 权限 | 理由 |
|---|---|---|
| `messages` | ? | |
| `likes` | ? | |
| `comments` | ? | |
| `configs` | ? | 全局配置，只读 |

<br>

**TODO-1**：填写上表并在报告中说明。

**可选项**：仅创建者可读写 / 所有用户可读，仅创建者可写 /
仅管理端可读写 / 所有用户可读写。

---

## 2.2 前端直连 vs 云函数

<!-- _class: smalltext -->

**TODO-2**：对下列操作，判断该走哪条路，并说明判据

| 操作 | 前端直连 / 云函数 | 理由 |
|---|---|---|
| 查询已发布的留言列表 | | |
| 查询我自己的全部留言（含审核中） | | |
| 发布一条留言 | | |
| 点赞 | | |
| 删除自己的留言 | | |
| 删除任意留言（管理员） | | |
| 统计每条留言的点赞数 | | |

<br>

**判据提示**：这个操作**需要业务校验**吗？需要**跨集合原子性**吗？

---

## 2.3 索引

<!-- _class: smalltext -->

**TODO-3**：为下列查询建立索引，并**对比建索引前后的耗时**

```js
// 查询 1：按时间倒序的已发布留言
db.collection('messages').where({ status: 'published' })
  .orderBy('createdAt', 'desc').limit(20).get()

// 查询 2：我是否点赞过某条留言
db.collection('likes').where({ _openid: OPENID, messageId: id }).count()

// 查询 3：某条留言的评论
db.collection('comments').where({ messageId: id, status: 'published' })
  .orderBy('createdAt', 'asc').get()
```

| 查询 | 索引字段 | 无索引耗时 | 有索引耗时 |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**造数据**：先用云函数批量插入 5000 条测试数据（`cloudfunctions/seed`）。

---

## 2.4 分页

<!-- _class: smalltext -->

```js
// TODO-4: 实现两种分页并对比
// 方案 A：skip + limit
async function pageBySkip(page, size = 20) { }

// 方案 B：游标（用上一页最后一条的 createdAt + _id）
async function pageByCursor(cursor, size = 20) { }
```

| 方案 | 第 1 页 | 第 10 页 | 第 100 页 | 数据变动时会漏/重吗 |
|---|---|---|---|---|
| skip + limit | | | | |
| 游标 | | | | |

<br>

**必答**：为什么大数据量下 `skip` 会越来越慢？
游标分页在什么情况下也会有问题？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第三节 任务二：云函数

---

## 3.1 函数组织

<!-- _class: smalltext -->

采用**一模块一函数 + 内部路由**：

```js
// cloudfunctions/message/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const handlers = {
  create: require('./handlers/create'),
  remove: require('./handlers/remove'),
  like:   require('./handlers/like'),
  comment:require('./handlers/comment'),
  list:   require('./handlers/list')
}

// TODO-5: 实现统一入口
exports.main = async (event, context) => {
  const { action, ...params } = event
  const ctx = cloud.getWXContext()
  // 1. 未知 action → { code: 40004 }
  // 2. try/catch，出错时 console.error 并返回 { code: 50000 }
  // 3. 统一返回 { code, data, message }
}
```

---

## 3.2 create：发布留言

<!-- _class: tinytext -->

```js
// cloudfunctions/message/handlers/create.js
module.exports = async function create({ content, images = [] }, { OPENID }) {
  // TODO-6: 校验
  //   content: 1-500 字，去除首尾空白
  //   images: 最多 9 张，且必须是 cloud:// 开头（防止注入外部 URL）

  // TODO-7: 频率限制 —— 同一用户 60 秒内最多发 3 条
  //   提示：查最近 60 秒该 openid 的记录数

  // TODO-8: 内容安全检测（云调用，见任务四）
  //   检测不通过 → status: 'rejected'，并返回明确提示

  // TODO-9: 写入数据库
  //   ⚠ _openid 由云开发自动写入，不要自己传 —— 但要理解为什么
  //   createdAt 用 db.serverDate()，不要用 new Date()

  return { code: 0, data: { _id } }
}
```

<br>

**必答**：为什么 `createdAt` 要用 `db.serverDate()` 而不是 `new Date()`？
（提示：云函数运行在服务器上，但客户端也可能传时间）

---

## 3.3 like：点赞（需要原子性）

<!-- _class: smalltext -->

```js
// TODO-10: 实现点赞/取消点赞
module.exports = async function like({ messageId }, { OPENID }) {
  const db = cloud.database()

  // 要求：
  // 1. 用事务保证「likes 表增删」与「messages.likeCount 增减」的一致性
  // 2. 重复点赞应该是幂等的（已点过就取消，或直接返回当前状态 —— 你来定义并说明）
  // 3. 留言不存在或已被删除 → 返回明确错误

  return await db.runTransaction(async transaction => {
    // ...
  })
}
```

<br>

**对照实验**：

1. 先写一个**不用事务**的版本；
2. 用云函数并发调用 20 次点赞/取消；
3. 检查 `likeCount` 与 `likes` 表的实际条数是否一致；
4. 改成事务版本，重复实验。

**记录两次的数据差异**。

---

## 3.4 冷启动测量

<!-- _class: smalltext -->

```js
// TODO-11: 在云函数里记录冷启动
let coldStart = true
const initTime = Date.now()

exports.main = async (event) => {
  const isCold = coldStart
  coldStart = false
  console.log('[perf]', { isCold, sinceInit: Date.now() - initTime })
  // ...
}
```

<br>

**实验**：

| 场景 | 端到端耗时 |
|---|---|
| 首次调用（冷启动） | |
| 连续调用（热） | |
| 停 10 分钟后再调 | |
| 初始化代码放在 handler **内部** | |
| 初始化代码放在 handler **外部** | |

**必答**：把 `cloud.init()` 放进 `exports.main` 里会怎样？为什么？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第四节 任务三：云存储

---

## 4.1 上传

<!-- _class: smalltext -->

```js
// services/upload.js

// TODO-12: 上传前压缩
async function compress(filePath) {
  const info = await wx.getImageInfo({ src: filePath })
  if (info.width <= 1080) return filePath
  const { tempFilePath } = await wx.compressImage({
    src: filePath, quality: 80, compressedWidth: 1080
  })
  return tempFilePath
}

// TODO-13: 上传到云存储
//   cloudPath 要分层：messages/{openid}/{yyyymm}/{uuid}.jpg
//   返回 fileID
async function uploadImage(filePath) { }

// TODO-14: 批量上传（最多 9 张），带并发限制与进度
async function uploadImages(filePaths, onProgress) { }
```

<br>

**测量**：一张 4MB 原图，压缩前后的**文件大小**与**上传耗时**各是多少？

---

## 4.2 展示与裁剪

```html
<!-- TODO-15: 列表里用缩略图，详情里用原图 -->
<image src="{{item.thumb}}" mode="aspectFill" lazy-load />
```

```js
// TODO-16: 把 fileID 转成带裁剪参数的临时 URL
async function toThumbUrl(fileID, width = 300) {
  const { fileList } = await wx.cloud.getTempFileURL({ fileList: [fileID] })
  const dpr = wx.getWindowInfo().pixelRatio
  return fileList[0].tempFileURL +
    `?imageView2/2/w/${Math.ceil(width * dpr)}/format/webp/q/80`
}
```

<br>

**对比**：20 条留言、每条 3 张图的列表，
用原图 vs 用缩略图，**首屏总下载量**各是多少 MB？

---

## 4.3 删除即清理

<!-- _class: smalltext -->

```js
// cloudfunctions/message/handlers/remove.js
// TODO-17: 删除留言时同步清理
module.exports = async function remove({ messageId }, { OPENID }) {
  // 1. 只能删自己的（用 OPENID 而不是参数里的作者 id）
  // 2. 删除关联的 likes 与 comments
  // 3. 删除云存储里的图片（cloud.deleteFile）
  // 4. 顺序：先删数据库还是先删文件？想清楚失败时会留下什么
}
```

<br>

**必答**：

1. 如果"删数据库成功、删文件失败"，会留下什么？如何补救？
2. 如果"删文件成功、删数据库失败"，会留下什么？哪个后果更严重？
3. 设计一个**孤儿文件清理**的定时任务（任务四会实现）。

---

## 4.4 容量监控

<!-- _class: smalltext -->

**TODO-18**：在云开发控制台记录

| 项 | 当前用量 | 免费额度 | 预警阈值 |
|---|---|---|---|
| 数据库存储 | | | |
| 数据库读次数/天 | | | |
| 数据库写次数/天 | | | |
| 云存储容量 | | | |
| 云存储下行流量/天 | | | |
| 云函数调用次数/天 | | | |
| 云函数 GBs/天 | | | |

<br>

**必答**：如果你的留言板有 1 万日活、人均浏览 20 条留言、
每条 3 张图，**每天的下行流量**大约是多少？免费额度够用吗？

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第五节 任务四：云调用与定时任务

---

## 5.1 内容安全检测

<!-- _class: smalltext -->

```json
// cloudfunctions/message/config.json
{
  "permissions": {
    "openapi": [
      "security.msgSecCheck",
      "security.mediaCheckAsync",
      "subscribeMessage.send",
      "wxacode.getUnlimited"
    ]
  }
}
```

```js
// TODO-19: 文本检测
async function checkText(content, openid) {
  const res = await cloud.openapi.security.msgSecCheck({
    version: 2, scene: 2, openid, content
  })
  // res.result.suggest: 'pass' | 'review' | 'risky'
  // res.result.label: 违规类型
}

// TODO-20: 图片异步检测
async function checkImages(fileIDs, openid) {
  // mediaCheckAsync 返回 trace_id，结果通过消息推送回调
  // 本实验：把 trace_id 存库，用定时任务轮询或用云函数的消息推送处理
}
```

**必答**：为什么图片检测是**异步**的？这对产品流程有什么影响？

---

## 5.2 审核状态流转

```text
用户提交
  ↓
status: 'pending'  ← 立即入库，用户能看到自己的
  ↓
文本检测（同步，秒级）
  ├─ risky  → status: 'rejected'，提示用户
  └─ pass   → 图片检测（异步，秒~分钟级）
                ├─ risky → status: 'rejected'
                └─ pass  → status: 'published'  ← 其他人可见
```

<br>

**TODO-21**：实现这个状态机，并在客户端展示对应状态

| status | 作者看到 | 他人看到 |
|---|---|---|
| pending | "审核中" 标签 | 不可见 |
| published | 正常 | 正常 |
| rejected | "未通过" + 原因 + 删除按钮 | 不可见 |

---

## 5.3 订阅消息

<!-- _class: smalltext -->

```js
// TODO-22: 有人评论我的留言时推送
async function notifyAuthor(messageId, commenterName) {
  const msg = await db.collection('messages').doc(messageId).get()
  const authorOpenid = msg.data._openid

  // 1. 检查订阅余额（存在 subscriptions 集合）
  // 2. 云调用发送
  const res = await cloud.openapi.subscribeMessage.send({
    touser: authorOpenid,
    templateId: TMPL_COMMENT,
    page: `pages/detail/detail?id=${messageId}`,
    data: {
      thing1: { value: truncate(msg.data.content, 20) },
      name2:  { value: commenterName },
      time3:  { value: formatTime(new Date()) }
    }
  })
  // 3. 成功则余额 -1；errcode 43101 则余额清零
}
```

<br>

**注意**：`thing` 类型**最多 20 个汉字**，超了会返回 47003。
`truncate` 必须实现正确。

---

## 5.4 定时任务

<!-- _class: smalltext -->

```json
// cloudfunctions/cleanup/config.json
{
  "triggers": [
    { "name": "dailyCleanup", "type": "timer", "config": "0 0 3 * * * *" }
  ]
}
```

```js
// TODO-23: 实现清理任务（凌晨 3 点跑）
exports.main = async (event) => {
  // 1. 幂等保护：同一天只跑一次
  // 2. 删除 30 天前的 rejected 留言及其图片
  // 3. 清理孤儿文件：云存储里存在、但数据库里没引用的图片
  // 4. 修正 likeCount：与 likes 表实际条数对齐
  // 5. 分批处理，避免超时（云函数最长 60s）
  // 6. 返回本次清理的统计数据并写入日志集合
}
```

<br>

**验证**：手动触发一次（控制台可以测试），
检查日志输出与实际清理结果是否一致。

---

## 5.5 环境隔离

<!-- _class: smalltext -->

```js
// config/cloud.js
// TODO-24: 按 envVersion 自动切换云环境
const ENV_MAP = {
  develop: 'dev-xxxxxx',
  trial:   'dev-xxxxxx',
  release: 'prod-xxxxxx'
}
export const CLOUD_ENV = ENV_MAP[__wxConfig.envVersion] || ENV_MAP.release
```

```js
// 云函数里
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })   // 自动用调用方所在环境
```

<br>

**验证**：

1. 在开发版里发一条留言，确认写进了 `dev` 环境；
2. 上传体验版，确认它也用 `dev`（`trial` 映射到 dev）；
3. 说明为什么**不能**把环境 ID 写死。

---

<!-- _class: trans -->
<!-- _paginate: "" -->

## 第六节 验收与提交

---

## 6.1 功能验收清单

<!-- _class: smalltext -->

- [ ] 发布图文留言（最多 9 图），图片自动压缩
- [ ] 内容含敏感词时被拒绝，提示清晰
- [ ] 列表分页加载，滚动流畅
- [ ] 点赞/取消点赞，`likeCount` 与 `likes` 表始终一致
- [ ] 评论功能，评论数正确
- [ ] 只能删除自己的留言
- [ ] 删除留言时图片同步被清理
- [ ] 有人评论时作者收到订阅消息（Mock 也要走完整链路）
- [ ] 三种审核状态在客户端展示正确
- [ ] 定时清理任务可手动触发且幂等
- [ ] 开发版与正式版使用不同云环境

---

## 6.2 评分标准

<!-- _class: smalltext -->

| # | 检查项 | 分值 |
|---|---|---|
| 1 | 24 个 TODO 全部补全，功能验收清单全部通过 | 25 |
| 2 | 权限设置合理 + 前端直连/云函数判断表正确 | 10 |
| 3 | 索引对比数据完整（3 组，5000 条数据） | 10 |
| 4 | 两种分页对比 + 必答问题正确 | 10 |
| 5 | 点赞事务对照实验（无事务 vs 有事务）数据完整 | 15 |
| 6 | 冷启动实验 5 组数据 + 必答正确 | 10 |
| 7 | 删除一致性三个必答 + 孤儿文件清理实现 | 10 |
| 8 | 容量估算合理，含 1 万日活的流量测算 | 10 |

---

## 6.3 常见问题

<!-- _class: smalltext -->

| 现象 | 原因 | 处理 |
|---|---|---|
| `cloud.init` 报环境不存在 | 环境 ID 写错 | 控制台复制 |
| 云函数 `require` 报错 | 函数目录下没 `npm install` | 每个函数目录单独装 |
| 客户端能查到别人的草稿 | 权限设成了"所有用户可读" | 改权限 + 云函数过滤 |
| `_openid` 是空的 | 用了管理端权限或本地调试 | 云函数里用 `getWXContext()` |
| 查询超时 | 无索引全表扫描 | 建索引 |
| 单次只返回 20 条 | 小程序端上限 | 云函数端可 100，或分批 |
| 事务报错 | 超过 5 秒或跨环境 | 精简事务内的操作 |
| 云调用权限错误 | `config.json` 没声明 | 声明后**重新上传部署** |
| 定时任务不触发 | Cron 是 7 位不是 5 位 | 核对格式，时区 UTC+8 |

---

## 6.4 拓展（选做，加分）

1. 实现**关键词搜索**：用 `db.RegExp` 做模糊匹配，
   并对比在 5000 条数据下有无索引的耗时（正则查询能用索引吗？）；
2. 实现**热门排序**：按 $\text{score} = \frac{\text{likeCount}}{(\text{hours}+2)^{1.5}}$ 排序，
   用聚合实现，并考虑如何避免每次全表计算；
3. 实现**@提醒**：解析留言里的 `@昵称`，给被提及者发订阅消息；
4. 把业务逻辑写成**不依赖 `wx-server-sdk`** 的纯函数 + 依赖注入，
   然后写一套 Jest 单测；再评估"迁移到自建后端"需要改多少代码。

---

<!-- _class: lastpage -->
<!-- _footer: "" -->

###### 实验十一 完

<div class="icons">

- <i class="fa-solid fa-envelope"></i>
  - jingming@sdu.edu.cn
- <i class="fa-solid fa-house"></i>
  - 数据科学与计算机学院
- <i class="fa-solid fa-weixin"></i>
  - 课程微信群
</div>
