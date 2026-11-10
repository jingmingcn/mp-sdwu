/**
 * 极简云开发模拟层。
 *
 * ⚠ 它只是让流程能跑通，**不能替代真实云开发**：
 *   - runTransaction 没有真正的原子性
 *   - 没有权限模型（_openid 只是一个普通字段）
 *   - 没有索引，所有查询都是全表扫描
 *   - cloud.openapi.* 完全不可用
 */
const MEM = {}
const FAKE_OPENID = 'local_mock_openid'

function collection(name) {
  if (!MEM[name]) MEM[name] = []
  const rows = MEM[name]

  function query(cond = {}) {
    let list = rows.filter(r => match(r, cond))
    const api = {
      orderBy(field, dir) {
        list = list.slice().sort((a, b) =>
          dir === 'desc' ? cmp(b[field], a[field]) : cmp(a[field], b[field]))
        return api
      },
      skip(n) { list = list.slice(n); return api },
      limit(n) { list = list.slice(0, n); return api },
      field() { return api },
      get() { return Promise.resolve({ data: list.map(clone) }) },
      count() { return Promise.resolve({ total: list.length }) },
      update({ data }) {
        list.forEach(r => Object.assign(r, resolveUpdate(r, data)))
        return Promise.resolve({ stats: { updated: list.length } })
      },
      remove() {
        list.forEach(r => rows.splice(rows.indexOf(r), 1))
        return Promise.resolve({ stats: { removed: list.length } })
      }
    }
    return api
  }

  return {
    add({ data }) {
      const _id = 'id_' + Math.random().toString(36).slice(2, 12)
      rows.push(Object.assign({ _id, _openid: FAKE_OPENID }, data))
      return Promise.resolve({ _id })
    },
    where: query,
    doc(id) {
      const one = () => rows.find(r => r._id === id)
      return {
        get: () => Promise.resolve({ data: clone(one()) }),
        update: ({ data }) => {
          const r = one()
          if (r) Object.assign(r, resolveUpdate(r, data))
          return Promise.resolve({ stats: { updated: r ? 1 : 0 } })
        },
        remove: () => {
          const r = one()
          if (r) rows.splice(rows.indexOf(r), 1)
          return Promise.resolve({ stats: { removed: r ? 1 : 0 } })
        }
      }
    },
    orderBy: (f, d) => query({}).orderBy(f, d),
    limit: n => query({}).limit(n),
    get: () => query({}).get(),
    count: () => query({}).count()
  }
}

// ── 指令（只实现常用的几个）──
const command = {
  eq: v => ({ $op: 'eq', v }),
  neq: v => ({ $op: 'neq', v }),
  gt: v => ({ $op: 'gt', v }),
  gte: v => ({ $op: 'gte', v }),
  lt: v => ({ $op: 'lt', v }),
  lte: v => ({ $op: 'lte', v }),
  in: v => ({ $op: 'in', v }),
  inc: n => ({ $update: 'inc', n }),
  set: v => ({ $update: 'set', v })
}

function match(row, cond) {
  return Object.keys(cond).every(k => {
    const c = cond[k]
    if (c && c.$op) {
      const v = row[k]
      switch (c.$op) {
        case 'eq': return v === c.v
        case 'neq': return v !== c.v
        case 'gt': return v > c.v
        case 'gte': return v >= c.v
        case 'lt': return v < c.v
        case 'lte': return v <= c.v
        case 'in': return c.v.indexOf(v) >= 0
      }
    }
    return row[k] === c
  })
}

function resolveUpdate(row, data) {
  const out = {}
  Object.keys(data).forEach(k => {
    const v = data[k]
    if (v && v.$update === 'inc') out[k] = (row[k] || 0) + v.n
    else if (v && v.$update === 'set') out[k] = v.v
    else out[k] = v
  })
  return out
}

const cmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0)
const clone = o => (o ? JSON.parse(JSON.stringify(o)) : o)

module.exports = function install(handlers = {}) {
  wx.cloud = {
    init() { console.warn('[local-mock] 使用本地模拟层，不是真实云开发') },
    database: () => ({
      collection,
      command,
      serverDate: () => new Date(),
      RegExp: ({ regexp, options }) => new RegExp(regexp, options),
      runTransaction: async fn => fn({ collection }) // ⚠ 无原子性
    }),
    async callFunction({ name, data }) {
      const h = handlers[name]
      if (!h) throw new Error('[local-mock] 未注册云函数: ' + name)
      return { result: await h(data, { OPENID: FAKE_OPENID }) }
    },
    uploadFile: ({ cloudPath, filePath }) =>
      Promise.resolve({ fileID: 'localmock://' + cloudPath, filePath }),
    getTempFileURL: ({ fileList }) =>
      Promise.resolve({ fileList: fileList.map(f => ({ fileID: f, tempFileURL: f })) }),
    deleteFile: () => Promise.resolve({ fileList: [] })
  }
}
