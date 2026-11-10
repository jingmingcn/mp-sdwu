const http = require('../request')
const { setItem, getItem, removeItem } = require('../utils/storage')

const ACCESS = 'auth:access'
const REFRESH = 'auth:refresh'
const USER = 'auth:user'
const REDIRECT = 'auth:redirect'

const getAccess = () => getItem(ACCESS)
const getRefresh = () => getItem(REFRESH)
const getUser = () => getItem(USER)

/** 包一层 Promise，避免每次都写回调 */
function wxLogin() {
  return new Promise((resolve, reject) => wx.login({ success: resolve, fail: reject }))
}

/**
 * TODO-17: wx.checkSession
 *
 * 为什么要先检查：wx.login 会让服务端已有的 session_key 立即失效。
 * 无脑在 onShow 里调 login，会导致服务端持有的 session_key 永远是过期的。
 */
function isSessionValid() {
  return new Promise(resolve => wx.checkSession({ success: () => resolve(true), fail: () => resolve(false) }))
}

/**
 * TODO-14: 静默登录
 *   1. session 有效且本地有 access token → 直接返回缓存的 user
 *   2. 否则 wx.login 拿 code，调 /auth/login
 *   3. 存 access（带 TTL）、refresh（7 天 TTL）、user
 */
async function login() {
  // const { code } = await wxLogin()
  // const { accessToken, refreshToken, expiresIn, user } = await http.post(
  //   '/auth/login', { code }, { _skipAuth: true, retry: false }
  // )
  // ...
}

let loginPromise = null

/**
 * TODO-15: 确保已登录
 *   要求：并发调用只发起一次真实登录（复用同一个 Promise）
 */
function ensureLogin() {
  return Promise.resolve()
}

/** TODO-16: 登出 —— 调服务端吊销 + 清本地 + 清各 store */
async function logout() {}

const setRedirect = path => setItem(REDIRECT, path, 10 * 60 * 1000)
const takeRedirect = () => {
  const p = getItem(REDIRECT)
  removeItem(REDIRECT)
  return p
}

module.exports = {
  login, ensureLogin, logout, isSessionValid, wxLogin,
  getAccess, getRefresh, getUser,
  setRedirect, takeRedirect,
  KEYS: { ACCESS, REFRESH, USER, REDIRECT }
}
