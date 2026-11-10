const { TAB, TABS } = require('../behaviors/tab-relation')

Component({
  behaviors: [TAB],

  // 作为 tabs 的直接子节点，不应该多出一层节点
  options: { virtualHost: true },

  relations: {
    tabs: { type: 'parent', target: TABS }
  },

  properties: {
    title: { type: String, value: '' },
    badge: { type: Number, value: 0 },
    disabled: { type: Boolean, value: false }
  },

  data: { active: false, everActive: false },

  methods: {
    /**
     * TODO-5: 首次激活后改用 hidden，保留内部状态
     * 提示：everActive 一旦为 true 就不再变回 false
     */
    setActive(active) {
      // this.setData({ active, everActive: this.data.everActive || active })
    }
  }
})
