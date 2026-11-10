# sdwu-ui

山东大学移动端小程序开发课程配套 UI 组件库。

## 安装

```bash
npm i sdwu-ui
```

然后在微信开发者工具中：**工具 → 构建 npm**，
再在 **详情 → 本地设置** 勾选 **使用 npm 模块**。

## 引用

```json
// app.json 或页面 json
{
  "usingComponents": {
    "sd-tabs": "sdwu-ui/tabs/index",
    "sd-tab": "sdwu-ui/tab/index",
    "star-rating": "sdwu-ui/star-rating/index"
  }
}
```

> 路径里**没有** `miniprogram_dist` —— `package.json` 的 `"miniprogram"` 字段
> 已经告诉开发者工具从哪里找组件。

---

## sd-tabs / sd-tab

```html
<sd-tabs current="{{0}}" bind:change="onTabChange">
  <sd-tab title="全部" badge="{{12}}">...</sd-tab>
  <sd-tab title="待付款">...</sd-tab>
  <sd-tab title="已完成" disabled>...</sd-tab>
</sd-tabs>
```

### sd-tabs 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| current | Number | `0` | 当前选中项下标 |

### sd-tabs 事件

| 事件 | detail | 触发时机 |
|---|---|---|
| change | `{ current: Number }` | 用户点击标题栏切换（`disabled` 项不触发） |

### sd-tabs 命令式 API

通过 `selectComponent` 获取，只暴露以下四个方法：

| 方法 | 说明 |
|---|---|
| `switchTo(index)` | 切到指定项 |
| `next()` / `prev()` | 切到下/上一项 |
| `getCurrent()` | 返回当前下标 |

### sd-tabs 外部样式类

| 类名 | 作用 |
|---|---|
| tab-class | 单个标题项 |

### sd-tab 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| title | String | `''` | 标题栏显示的文字 |
| badge | Number | `0` | 徽标数字，`0` 时不显示 |
| disabled | Boolean | `false` | 禁用，点击标题无效 |

### CSS 变量

| 变量 | 默认值 |
|---|---|
| `--sd-brand` | `#551645` |
| `--sd-border` | `#eee` |
| `--sd-text-muted` | `#8c8c8c` |
| `--sd-danger` | `#c0392b` |

### 注意事项

- `<sd-tab>` **必须**是 `<sd-tabs>` 的直接子节点（relations 用的是 `parent`/`child`）
- `<sd-tab>` 首次激活后改用 `hidden` 隐藏，内部组件状态会被保留
- 使用方通过 `wx:for` 动态生成 tab 时，增删会触发 `linked` / `unlinked`，父组件自动重新同步

---

## star-rating

见 [star-rating/README.md](src/star-rating/README.md)。
