const http = require('../../request')
const auth = require('../../services/auth')
const { setItem, getItem } = require('../../utils/storage')

function b64urlDecode(s) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  // 小程序里没有 atob，用 Base64 解码的简易实现
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let str = pad.replace(/=+$/, ''), out = ''
  for (let bc = 0, bs = 0, buf, i = 0; (buf = str.charAt(i++)); ) {
    buf = chars.indexOf(buf)
    if (~buf) {
      bs = bc % 4 ? bs * 64 + buf : buf
      if (bc++ % 4) out += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))
    }
  }
  return decodeURIComponent(escape(out))
}

function b64urlEncode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  const s = unescape(encodeURIComponent(str))
  let out = ''
  for (let i = 0; i < s.length; ) {
    const c1 = s.charCodeAt(i++), c2 = s.charCodeAt(i++), c3 = s.charCodeAt(i++)
    out += chars.charAt(c1 >> 2)
    out += chars.charAt(((c1 & 3) << 4) | (c2 >> 4))
    out += isNaN(c2) ? '=' : chars.charAt(((c2 & 15) << 2) | (c3 >> 6))
    out += isNaN(c3) ? '=' : chars.charAt(c3 & 63)
  }
  return out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

Component({
  data: { logs: [], localAdmin: false, points: 0, targetUid: '' },

  methods: {
    onShow() {
      const u = auth.getUser() || {}
      this.setData({ localAdmin: !!u.isAdmin, points: u.points || 0 })
    },

    push(...a) {
      const line = a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')
      console.log('[atk]', line)
      this.setData({ logs: [line, ...this.data.logs].slice(0, 50) })
    },

    onUid(e) { this.setData({ targetUid: e.detail.value }) },

    /** TODO-23: 越权访问 —— 用别人的 uid 拉数据 */
    async attackOverreach() {
      const uid = this.data.targetUid
      try {
        const r = await http.get('/orders', { uid })
        this.push('拿到订单', r)
        this.push(r && r[0] && String(r[0].uid) === String(uid)
          ? '★ 攻击成功：服务端用了请求参数里的 uid'
          : '✓ 防护有效：服务端用的是 token 里的 uid')
      } catch (e) { this.push('请求失败', e.message) }
    },

    /** TODO-24: 篡改本地状态 */
    attackLocalState() {
      const u = auth.getUser() || {}
      setItem(auth.KEYS.USER, Object.assign({}, u, { isAdmin: true }))
      this.setData({ localAdmin: true })
      this.push('本地 user.isAdmin 已改为 true —— 前端按钮出现了')
    },

    async callAdmin() {
      try {
        const r = await http.post('/admin/reset')
        this.push('★ 服务端接受了！这是漏洞', r)
      } catch (e) {
        this.push('✓ 服务端拒绝', e.code, e.message)
      }
    },

    decodeToken() {
      const t = auth.getAccess()
      if (!t) return this.push('先登录')
      const [h, p] = t.split('.')
      this.push('header  =', b64urlDecode(h))
      this.push('payload =', b64urlDecode(p))
      this.push('↑ payload 是「仅编码」不是「加密」—— 任何人都能看到')
    },

    /** TODO-25: 伪造 token —— 改 payload 不改签名 */
    async attackForgeToken() {
      const t = auth.getAccess()
      if (!t) return this.push('先登录')
      const [h, p, s] = t.split('.')
      const payload = JSON.parse(b64urlDecode(p))
      const forged = [h, b64urlEncode(JSON.stringify(Object.assign({}, payload, { uid: 1 }))), s].join('.')
      this.push('伪造 token（uid 改成 1，签名不动）')
      try {
        const r = await http.get('/profile', {}, { _skipAuth: true, header: { Authorization: 'Bearer ' + forged } })
        this.push('★ 服务端接受了伪造 token！', r)
      } catch (e) {
        this.push('✓ 服务端识破', e.code, e.message)
      }
    },

    /** TODO-26: 重放 —— 连续签到 20 次 */
    async attackReplay() {
      let last = null
      for (let i = 0; i < 20; i++) {
        try { last = await http.post('/checkin') } catch (e) { this.push('第', i + 1, '次失败', e.message); break }
      }
      this.push('20 次签到后积分 =', last && last.points)
      this.setData({ points: (last && last.points) || 0 })
      this.push(last && last.points >= 200
        ? '★ 攻击成功：没有幂等保护'
        : '✓ 防护有效')
    }
  }
})
