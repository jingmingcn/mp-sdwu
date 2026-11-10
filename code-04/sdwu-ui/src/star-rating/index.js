/**
 * star-rating 星级评分
 *
 * 设计要点：
 *   - virtualHost：组件节点不生成，避免破坏父级 flex
 *   - pureDataPattern：_ 开头的字段不参与渲染、不跨线程
 *   - 受控 / 非受控双模式：传了 value 就是受控
 *   - 模板里没有任何计算，全部由 observers 派生
 */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

Component({
  options: {
    virtualHost: true,
    pureDataPattern: /^_/,
    multipleSlots: false
  },

  behaviors: [require('../behaviors/interactive')],

  externalClasses: ['star-class', 'text-class'],

  properties: {
    // 传入即受控。用 null 作为「未传入」的哨兵值。
    value: { type: Number, optionalTypes: [null], value: null },
    defaultValue: { type: Number, value: 0 },
    max: { type: Number, value: 5 },
    allowHalf: { type: Boolean, value: false },
    size: { type: Number, value: 48 },
    gap: { type: Number, value: 8 },
    texts: { type: Array, value: [] }
  },

  data: {
    stars: [],     // [{ ratio: 0~1 }]
    current: 0,
    text: '',
    _inner: 0      // 非受控模式下的内部值（纯数据字段）
  },

  observers: {
    /**
     * TODO-5: 派生 current / stars / text
     *
     * current: 受控时取 value，非受控时取 _inner
     * stars:   长度为 max，第 i 项的 ratio = clamp(current - i, 0, 1)
     * text:    texts[Math.ceil(current) - 1] || ''
     *
     * 注意：这三个都是「只写不监听」的派生字段，不要把它们加进监听列表，否则死循环。
     */
    'value, _inner, max, texts': function (value, inner, max, texts) {
      // const current = ...
      // const stars = Array.from({ length: max }, (_, i) => ({ ratio: clamp(current - i, 0, 1) }))
      // this.setData({ current, stars, text: ... })
    }
  },

  lifetimes: {
    attached() {
      // TODO-6: observers 不会因为 data 的初始值而触发。
      //   用 defaultValue 初始化 _inner，从而触发一次 observers。
      //   注意：受控模式下不应该动 _inner。
    }
  },

  methods: {
    /** 传了 value（非 null/undefined）即为受控 */
    isControlled() {
      const v = this.data.value
      return v !== null && v !== undefined
    },

    /**
     * TODO-2: 处理点击
     *
     * 半星判定需要知道点击位置在星内的相对比例。
     * SelectorQuery 是异步的，每次点击都查一次会有延迟 ——
     * 更好的办法：在 ready 里量一次并缓存，或改用 touchstart 的 pageX。
     */
    onTap(e) {
      if (!this.canInteract()) return

      const index = Number(e.currentTarget.dataset.index) // 0 起
      // const next = this.data.allowHalf ? ... : index + 1
      // this.commit(next)
    },

    /**
     * TODO-3: 统一的提交入口
     *
     * 非受控：改自己的 _inner，同时 triggerEvent
     * 受控：  不改自己的状态，只 triggerEvent —— 界面由父级传回的 value 决定
     */
    commit(next) {
      // if (!this.isControlled()) this.setData({ _inner: next })
      // this.triggerEvent('change', { value: next })
    }
  }
})
