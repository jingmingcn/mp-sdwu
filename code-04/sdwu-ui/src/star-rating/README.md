# star-rating 星级评分

## 用法

```html
<star-rating value="{{score}}" max="{{5}}" allow-half bind:change="onChange" />
```

```js
onChange(e) { this.setData({ score: e.detail.value }) }
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| value | Number | `null` | 当前分值。**传入即变为受控**，组件不再自行改变状态 |
| defaultValue | Number | `0` | 非受控模式的初始值 |
| max | Number | `5` | 星星总数 |
| allowHalf | Boolean | `false` | 是否允许半星 |
| readonly | Boolean | `false` | 只读，不响应点击且不触发 change |
| disabled | Boolean | `false` | 同 readonly（语义上表示"暂不可用"） |
| size | Number | `48` | 单星尺寸，单位 rpx |
| gap | Number | `8` | 星间距，单位 rpx |
| texts | Array | `[]` | 分值对应的描述文字，如 `['很差','较差','一般','满意','非常满意']` |

## 事件

| 事件 | detail | 触发时机 |
|---|---|---|
| change | `{ value: Number }` | 用户点击改变分值。`readonly` / `disabled` 时不触发 |

## 外部样式类

| 类名 | 作用 |
|---|---|
| star-class | 单颗星的容器 |
| text-class | 描述文字 |

## CSS 变量

| 变量 | 默认值 | 作用 |
|---|---|---|
| `--star-active-color` | `#f5a623` | 点亮颜色 |
| `--star-inactive-color` | `#dcdcdc` | 未点亮颜色 |
| `--star-text-color` | `#8c8c8c` | 描述文字颜色 |

CSS 变量继承自 DOM 树，**不受组件样式隔离影响**，是换肤最干净的方案。

## 注意事项

- 同时传 `value` 和 `defaultValue` 时，以 `value` 为准（受控优先）
- 组件开启了 `virtualHost`，宿主节点不会生成，可安全放进 flex 容器
- `allowHalf` 与整星模式共用同一套 `ratio` 计算公式，没有分支
