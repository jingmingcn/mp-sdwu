/**
 * 内存版存储。
 * 生产环境请换成 MySQL/PostgreSQL + Redis。
 */
const users = new Map()        // uid -> user
const byOpenid = new Map()     // openid -> uid
const sessionKeys = new Map()  // uid -> session_key   ← 只在服务端
const refreshTokens = new Map()// token -> { uid, expireAt, used }
const checkins = new Map()     // `${uid}:${date}` -> true
const nonces = new Map()       // nonce -> expireAt

let seq = 1000

function findOrCreateByOpenid(openid, unionid) {
  if (byOpenid.has(openid)) return users.get(byOpenid.get(openid))
  const uid = ++seq
  const user = {
    id: uid,
    openid,
    unionid: unionid || null,
    nickname: '同学' + uid,
    avatar: '',
    points: 0,
    // ⚠ 权限标志来自数据库，绝不来自请求参数
    isAdmin: false,
    createdAt: new Date().toISOString()
  }
  users.set(uid, user)
  byOpenid.set(openid, uid)
  return user
}

/** 对外暴露的用户字段 —— 绝不包含 openid / session_key */
function publicUser(u) {
  return { id: u.id, nickname: u.nickname, avatar: u.avatar, points: u.points, isAdmin: u.isAdmin }
}

/** 演示用的订单数据：uid → orders */
function ordersOf(uid) {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `${uid}-${i}`,
    uid,
    title: `用户 ${uid} 的订单 ${i}`,
    amountInCent: 1000 * (i + 1)
  }))
}

module.exports = {
  users, byOpenid, sessionKeys, refreshTokens, checkins, nonces,
  findOrCreateByOpenid, publicUser, ordersOf
}
