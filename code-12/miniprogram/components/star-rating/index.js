const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

Component({
  options: { virtualHost: true, pureDataPattern: /^_/ },

  properties: {
    value: { type: Number, optionalTypes: [null], value: null },
    defaultValue: { type: Number, value: 0 },
    max: { type: Number, value: 5 },
    readonly: { type: Boolean, value: false }
  },

  data: { stars: [], current: 0, _inner: 0 },

  observers: {
    'value, _inner, max': function (value, inner, max) {
      const current = this.isControlled() ? value : inner
      this.setData({
        current,
        stars: Array.from({ length: max }, (_, i) => ({ ratio: clamp(current - i, 0, 1) }))
      })
    }
  },

  lifetimes: {
    attached() {
      if (!this.isControlled()) this.setData({ _inner: this.data.defaultValue })
      else this.setData({ _inner: this.data._inner })
    }
  },

  methods: {
    isControlled() {
      const v = this.data.value
      return v !== null && v !== undefined
    },

    onTap(e) {
      if (this.data.readonly) return
      const next = Number(e.currentTarget.dataset.index) + 1
      if (!this.isControlled()) this.setData({ _inner: next })
      this.triggerEvent('change', { value: next })
    }
  }
})
