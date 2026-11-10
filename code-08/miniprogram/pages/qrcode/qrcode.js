const { BASE_URL } = require('../../config')

function req(path, method, data) {
  return new Promise((resolve, reject) => {
    wx.request({ url: BASE_URL + path, method: method || 'GET', data,
      header: { 'content-type': 'application/json' },
      success: r => resolve(r.data), fail: reject })
  })
}

// 一个真实业务里会遇到的超长推广参数
const LONG_PARAMS = {
  goodsId: 10086,
  inviterId: 'u_9f3c1a2b',
  channel: 'campus_autumn_2026',
  campaign: 'freshman_welcome_package',
  sig: 'a1b2c3d4e5f6a7b8'
}

Component({
  data: { image: '', logs: [], key: '' },

  methods: {
    push(...a) {
      const line = a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')
      this.setData({ logs: [line, ...this.data.logs].slice(0, 20) })
    },

    onKey(e) { this.setData({ key: e.detail.value }) },

    /** 直接把长参数当 scene 传 —— 记录错误信息原文 */
    async genLong() {
      const scene = Object.keys(LONG_PARAMS).map(k => `${k}=${LONG_PARAMS[k]}`).join('&')
      this.push(`scene 长度 = ${scene.length}`)
      const r = await req('/qrcode', 'POST', { scene, page: 'pages/goods/detail' })
      this.push('结果', r)
    },

    /** TODO-16 的客户端侧：让服务端生成短 key */
    async genShortKey() {
      const r = await req('/qrcode', 'POST', { params: LONG_PARAMS, page: 'pages/goods/detail' })
      this.push('短 key =', r.data && r.data.scene)
      this.setData({ image: (r.data && r.data.image) || '' })
    },

    /**
     * TODO-18: scene 是 URL 编码过的，必须 decodeURIComponent
     * 真实场景里这段逻辑应放在被扫码打开的那个页面的 onLoad 里。
     */
    async resolve() {
      const key = decodeURIComponent(this.data.key || '')
      const r = await req('/scene?key=' + encodeURIComponent(key))
      this.push('还原参数', r)
    }
  }
})
