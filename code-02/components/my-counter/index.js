/**
 * 自带内部状态的组件。
 * 列表重排时，如果没有 wx:key，这个 count 会「跟着位置走」而不是「跟着数据走」——
 * 这就是 key 缺失最严重的后果：不只是慢，而是状态错位。
 */
Component({
  options: { virtualHost: true },
  data: { count: 0 },
  methods: {
    inc() { this.setData({ count: this.data.count + 1 }) }
  }
})
