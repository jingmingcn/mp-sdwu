const http = require('../../request')

Component({
  behaviors: [require('../../behaviors/auth-required')],

  data: { profile: {}, orders: [] },

  methods: {
    /** behavior 校验通过后回调这里 */
    async onAuthReady() {
      const [profile, orders] = await Promise.all([
        http.get('/profile'),
        http.get('/orders')
      ])
      this.setData({ profile, orders })
    }
  }
})
