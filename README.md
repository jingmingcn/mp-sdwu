# 微信小程序高级开发（Advanced MiniProgram Development）

山东大学 数据科学与计算机学院 · 2026 年秋

课件使用 [Marp](https://marp.app/) 编写，主题基于 `themes/am_*.scss`（Awesome-Marp 系列）。

---

## 目录结构

```
mp-sdwu/
├── template.md          # 幻灯片模板（新建课件时复制它）
├── ch-01.md … ch-12.md  # 理论课件
├── lab-01.md … lab-12.md# 实验指导课件
├── code-01/ … code-12/  # 各实验配套工程（原生小程序 + npm 构建）
├── themes/              # Marp 主题（scss）
├── images/              # 校徽 / 院徽等公共图片
└── .vscode/settings.json
```

理论与实验一一对应：`ch-0X` → `lab-0X` → `code-0X`。

---

## 课程大纲

| # | 理论课件 | 实验课件 | 配套工程 | 核心能力 |
|---|---|---|---|---|
| 01 | 小程序架构原理与运行机制 | 运行机制观测与工程骨架 | `code-01` | 双线程模型、启动流程、setData 代价 |
| 02 | 渲染层深入：WXML / WXS / Skyline | 渲染性能与 WXS 实战 | `code-02` | 编译产物、WXS 响应事件、Skyline 迁移 |
| 03 | 自定义组件进阶 | 可复用星级评分组件 | `code-03` | Component 构造器、observers、behaviors |
| 04 | 组件通信与组件库工程化 | 发布一个 npm 组件包 | `code-04` | relations、抽象节点、miniprogram_dist |
| 05 | 状态管理与数据流设计 | MobX 购物车 | `code-05` | globalData、EventBus、MobX 分层 |
| 06 | 网络层封装与数据持久化 | 带拦截器的请求库 | `code-06` | Promise 化、拦截器、重试、缓存策略 |
| 07 | 登录鉴权与前端安全 | 登录全链路（含 Mock 服务端） | `code-07` | code2Session、自定义登录态、数据校验 |
| 08 | 微信开放能力 | 分享 / 订阅消息 / 手机号 | `code-08` | 开放接口的申请、调用与降级 |
| 09 | 性能优化与体验提升 | 启动优化 + 长列表 + 骨架屏 | `code-09` | 分包预下载、虚拟列表、首屏指标 |
| 10 | 原生能力与跨端方案 | WebView 与原生组件互操作 | `code-10` | 同层渲染、JSSDK 桥接、跨端选型 |
| 11 | 云开发与 Serverless 架构 | 云开发留言板 | `code-11` | 云函数、云数据库、云存储、权限 |
| 12 | 工程化、测试与发布运维 | 单元测试 + CI 自动化发布 | `code-12` | miniprogram-ci、自动化测试、监控 |

---

## 构建课件

### 方式一：VS Code（推荐用于编写）

安装 **Marp for VS Code** 扩展，仓库里的 `.vscode/settings.json` 已经注册了全部主题并开启了 HTML。
打开任意 `ch-0X.md`，右上角点击预览即可。

### 方式二：命令行导出

```bash
npm install
```

```bash
npm run pdf
```

可用脚本：

| 脚本 | 说明 |
|---|---|
| `npm run pdf` | 导出全部课件为 PDF 到 `dist/` |
| `npm run html` | 导出全部课件为 HTML 到 `dist/` |
| `npm run pptx` | 导出全部课件为 PPTX 到 `dist/` |
| `npm run watch` | 起本地服务实时预览整个目录 |
| `npm run pdf ch-03.md` | 只导出指定文件 |

导出配置在 `.marprc.yml` 里，已开启 `html: true` 与 `allowLocalFiles: true`。

> 两个必须知道的点：
>
> 1. 主题是 `.scss` 后缀，而 `--theme-set` 指向目录时**只扫描 `*.css`** ——
>    所以 `.marprc.yml` 里逐个列出了主题文件，不要改成目录形式；
> 2. marp-cli 一次处理多个文件时不允许指定 `--output`，
>    所以 `scripts/build.js` 逐个文件调用它。

---

## 运行实验工程

通用步骤：

1. 微信开发者工具 → 导入项目 → 选择下表中的**导入目录**；
2. AppID 填自己的测试号（`code-11` 云开发实验**需要真实 AppID**）；
3. 若目录下有 `package.json`，先在该目录 `npm install`，
   再在开发者工具中执行 **工具 → 构建 npm**；
4. 勾选 **本地设置 → 使用 npm 模块**。

**注意：有几个实验的小程序工程不在 `code-0X/` 根目录**，
因为它们还带了服务端或组件包：

| 实验 | 导入目录 | 额外组件 |
|---|---|---|
| 01 02 03 05 06 09 10 11 | `code-0X/` | 06/10 另有 `server/` `h5/` 需 `node` 启动 |
| 04 | `code-04/demo/` | `code-04/sdwu-ui/` 是要发布的组件包 |
| 07 | `code-07/miniprogram/` | `code-07/server/` （Express，`npm start`） |
| 08 | `code-08/miniprogram/` | `code-08/server/` （零依赖，`node index.js`） |
| 12 | `code-12/miniprogram/` | 根目录跑 `npm run ci:local` |

需要先启动本地服务的实验（06 07 08 10），
开发者工具里要勾选 **详情 → 本地设置 → 不校验合法域名**。

各工程的具体说明见 `code-0X/README.md`。

---

## 编写约定

- 新课件从 `template.md` 复制，只改 front-matter 里的 `footer` 与封面页内容；
- 一级分节用 `<!-- _class: trans -->` 的过渡页，二级用 `##`，三级用 `###`；
- 代码超过 12 行时给幻灯片加 `<!-- _class: smalltext -->`，超过 20 行加 `tinytext`；
- 每章结尾固定一页 `lastpage`；
- 图片放 `images/`，实验截图放 `images/lab/`。
