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
    canInteract() { return !this.data._i_locked }
  }
})
