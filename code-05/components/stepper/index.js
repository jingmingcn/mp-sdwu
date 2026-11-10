/** 受控数量步进器：自己不存值，一切通过 change 抛给父级。 */
Component({
  options: { virtualHost: true },
  properties: {
    value: { type: Number, value: 1 },
    min: { type: Number, value: 1 },
    max: { type: Number, value: 99 }
  },
  methods: {
    emit(next) {
      const { min, max } = this.data
      this.triggerEvent('change', { value: Math.max(min, Math.min(max, next)) })
    },
    inc() { this.emit(this.data.value + 1) },
    dec() { this.emit(this.data.value - 1) },
    onInput(e) { this.emit(Number(e.detail.value)) }
  }
})
