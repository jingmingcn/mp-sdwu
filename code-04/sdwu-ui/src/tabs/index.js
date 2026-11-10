const { TABS, TAB } = require('../behaviors/tab-relation')

/**
 * sd-tabs
 *
 * 为什么必须用 relations：
 *   <sd-tab> 是「使用方」写在插槽里的，父组件无法通过 properties 拿到它们的信息。
 *   relations 让父子在运行时建立关联，父组件可以直接读子组件的 data、调子组件的方法。
 */
Component({
  behaviors: [TABS, 'wx://component-export'],

  externalClasses: ['tab-class'],

  properties: {
    current: { type: Number, value: 0 }
  },

  data: {
    titles: [],
    activeIndex: 0,
    inkLeft: 0,
    inkWidth: 0,
    scrollInto: ''
  },

  relations: {
    tab: {
      type: 'child',
      target: TAB,
      // TODO-1: linked / linkChanged / unlinked 都要重新同步
      linked() { this.syncTabs() },
      linkChanged() { this.syncTabs() },
      unlinked() { this.syncTabs() }
    }
  },

  observers: {
    current(v) { this.activate(v) }
  },

  export() {
    // TODO-6: 只暴露这四个方法，内部实现完全隐藏
    return {
      switchTo: index => this.activate(index),
      next: () => this.activate(Math.min(this.data.activeIndex + 1, this.data.titles.length - 1)),
      prev: () => this.activate(Math.max(this.data.activeIndex - 1, 0)),
      getCurrent: () => this.data.activeIndex
    }
  },

  methods: {
    /**
     * TODO-2: 从关联节点读出标题/徽标/禁用状态，并激活当前项
     */
    syncTabs() {
      const nodes = this.getRelationNodes('tab')
      // this.setData({ titles: nodes.map(n => ({ ... })) })
      // this.activate(this.data.activeIndex)
    },

    /**
     * TODO-3: 只让第 index 个 tab 可见
     * 提示：getRelationNodes 返回的是组件实例，可以直接调它的 setActive
     */
    activate(index) {
      // const nodes = this.getRelationNodes('tab')
      // nodes.forEach((n, i) => n.setActive(i === index))
      // this.setData({ activeIndex: index, scrollInto: 'tab-' + index })
      // this.updateInk(index)
    },

    /**
     * TODO-4: 点击标题栏，跳过 disabled 项，触发 change
     */
    onTitleTap(e) {
      // const index = Number(e.currentTarget.dataset.index)
      // if (this.data.titles[index] && this.data.titles[index].disabled) return
      // this.activate(index)
      // this.triggerEvent('change', { current: index })
    },

    /** 下划线跟随（选做：需要量节点，注意异步） */
    updateInk(index) {
      this.createSelectorQuery()
        .select(`#tab-${index}`).boundingClientRect()
        .select('.sd-tabs__bar').boundingClientRect()
        .exec(([item, bar]) => {
          if (!item || !bar) return
          this.setData({ inkLeft: item.left - bar.left, inkWidth: item.width })
        })
    }
  }
})
