# 跨端对比（任务四）

三份实现同一个页面（商品列表 + 详情）：

```
cross/
├── native/    # 原生小程序
├── taro/      # Taro（运行时方案，React）
└── uni/       # uni-app（Vue）
```

## 为什么这里只有说明没有完整代码

跨端框架的脚手架依赖网络与具体版本，写死在仓库里很快会过期。
请按下面的步骤自己生成，**这本身就是选型评估的一部分**——
"上手成本"是选型的重要维度。

## 生成步骤

### Taro

```bash
npx @tarojs/cli init taro
```

选择：React + TypeScript(否) + Sass(否) + 模板 default。

```bash
cd taro && npm install && npm run build:weapp
```

产物在 `taro/dist/`，用开发者工具导入它。

### uni-app

```bash
npx degit dcloudio/uni-preset-vue#vite uni
```

```bash
cd uni && npm install && npm run build:mp-weixin
```

产物在 `uni/dist/build/mp-weixin/`。

### 原生

`native/` 里已给出参考实现，直接导入即可。

## 要做的事

**TODO-21**：在同一台真机上测量

| 指标 | 原生 | Taro | uni-app |
|---|---|---|---|
| 主包大小 | | | |
| 冷启动耗时 | | | |
| 1000 条列表首屏 | | | |
| 滚动 FPS | | | |
| 内存峰值 | | | |

**TODO-22**：在三份实现里各做一次同样的改动
（给列表项加"收藏"按钮 + 收藏状态管理），记录

| 维度 | 原生 | Taro | uni-app |
|---|---|---|---|
| 改动文件数 | | | |
| 耗时 | | | |
| 遇到的坑 | | | |
| 查文档次数 | | | |
| 报错信息是否清晰 | | | |

这个对比**必然带有主观性**，请如实记录——
包括"因为我更熟悉 React 所以 Taro 更快"这类因素。

## 三个选型场景

见 `lab-10.md` 第 5.3 节。每个场景要说明
**选什么、为什么、放弃了什么、风险是什么**。
