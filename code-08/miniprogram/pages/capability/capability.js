const { BASE_URL, TMPL } = require('../../config')
const { withFallback, ensureScope, getDegrades } = require('../../utils/capability')

const CITIES = ['济南', '青岛', '威海', '烟台', '北京', '上海']

function req(path, method, data) {
  return new Promise((resolve, reject) => {
    wx.request({ url: BASE_URL + path, method: method || 'GET', data,
      header: { 'content-type': 'application/json' },
      success: r => (r.data && r.data.code === 0 ? resolve(r.data.data) : reject(new Error(r.data && r.data.message))),
      fail: reject })
  })
}

Component({
  data: {
    forceFail: false,
    phone: '-', manualPhone: false,
    subResult: '-', useInbox: false,
    shareLink: '',
    location: '-', manualCity: false, cities: CITIES, city: CITIES[0],
    logs: []
  },

  methods: {
    push(...a) {
      const line = a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')
      console.log('[cap]', line)
      this.setData({ logs: [line, ...this.data.logs].slice(0, 30) })
    },

    onForce(e) { this.setData({ forceFail: e.detail.value }) },

    // ── ① 手机号 ──
    async onPhone(e) {
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        this.push('用户取消手机号授权 → 降级')
        return this.phoneFallback()
      }
      try {
        const r = await req('/user/phone', 'POST', { code: e.detail.code })
        this.setData({ phone: r.phoneNumber, manualPhone: false })
      } catch (err) {
        this.push('换取手机号失败 → 降级', err.message)
        this.phoneFallback()
      }
    },

    phoneFallback() {
      this.push('[降级] 手机号 → 手动输入 + 短信验证码')
      this.setData({ manualPhone: true })
    },

    onManualPhone(e) { this._manual = e.detail.value },
    sendCode() { wx.showToast({ title: '验证码已发送（Mock）', icon: 'none' }) },

    // ── ② 订阅消息 ──
    async trySubscribe() {
      const result = await withFallback(
        'wx.requestSubscribeMessage',
        async () => {
          if (this.data.forceFail) throw new Error('强制失败')
          const res = await wx.requestSubscribeMessage({ tmplIds: [TMPL.SHIPPED] })
          if (res[TMPL.SHIPPED] !== 'accept') throw new Error('用户拒绝')
          return '已订阅'
        },
        () => {
          this.push('[降级] 订阅消息 → 站内消息中心 + 小红点')
          this.setData({ useInbox: true })
          return '降级到站内消息'
        }
      )
      this.setData({ subResult: result })
    },

    // ── ③ 小程序码 ──
    async tryQrcode() {
      await withFallback(
        'wx.request',
        async () => {
          if (this.data.forceFail) throw new Error('access_token 获取失败')
          const r = await req('/qrcode', 'POST', { params: { goodsId: 1 }, page: 'pages/goods/detail' })
          this.setData({ shareLink: '' })
          this.push('小程序码已生成', r.scene)
          return r
        },
        () => {
          this.push('[降级] 小程序码 → 可复制的分享链接')
          this.setData({ shareLink: 'https://sdwu.example.com/s/abc123' })
        }
      )
    },

    copyLink() {
      wx.setClipboardData({ data: this.data.shareLink })
    },

    // ── ④ 定位 ──
    async tryLocation() {
      await withFallback(
        'wx.getLocation',
        async () => {
          if (this.data.forceFail) throw new Error('接口未申请')
          const granted = await ensureScope('scope.userLocation', {
            title: '需要位置权限', content: '用于展示附近门店并计算距离'
          })
          if (!granted) throw new Error('用户拒绝')
          const loc = await wx.getLocation({ type: 'gcj02' })
          this.setData({ location: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`, manualCity: false })
          return loc
        },
        () => {
          this.push('[降级] 定位 → 手动选择城市')
          this.setData({ manualCity: true, location: '手动选择：' + this.data.city })
        }
      )
    },

    onCity(e) {
      const city = CITIES[Number(e.detail.value)]
      this.setData({ city, location: '手动选择：' + city })
    },

    onUnload() { console.log('[cap] 本次降级记录', getDegrades()) }
  }
})
