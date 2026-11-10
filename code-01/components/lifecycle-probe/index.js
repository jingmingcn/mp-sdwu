const { log } = require('../../utils/logger')

/**
 * 生命周期探针组件。
 *
 * 观察要点：
 *   created  是「父先子后」
 *   ready    是「子先父后」
 * 这就是为什么父组件可以在自己的 ready 里安全地 selectComponent。
 */
Component({
  options: { virtualHost: true },
  properties: { label: { type: String, value: 'A' } },

  lifetimes: {
    created() { log('Comp', `[${this.data.label}] created`) },
    attached() { log('Comp', `[${this.data.label}] attached`) },
    ready() { log('Comp', `[${this.data.label}] ready`) },
    moved() { log('Comp', `[${this.data.label}] moved`) },
    detached() { log('Comp', `[${this.data.label}] detached`) }
  },

  pageLifetimes: {
    show() { log('Comp', `[${this.data.label}] pageLifetimes.show`) },
    hide() { log('Comp', `[${this.data.label}] pageLifetimes.hide`) },
    resize(size) { log('Comp', `[${this.data.label}] pageLifetimes.resize`, size) }
  }
})
