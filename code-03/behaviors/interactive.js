/**
 * 可交互性 behavior：统一处理 readonly / disabled。
 *
 * 命名约定：behavior 内部的 data 字段加 _i_ 前缀，降低与宿主组件的冲突概率。
 */
module.exports = Behavior({
  properties: {
    readonly: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false }
  },

  data: { _i_locked: false },

  observers: {
    'readonly, disabled': function (readonly, disabled) {
      this.setData({ _i_locked: !!(readonly || disabled) })
    }
  },

  methods: {
    // TODO-9: 返回是否可交互；组件在事件处理开头调用它
    canInteract() {
      return true
    }
  }
})
