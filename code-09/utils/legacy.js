/**
 * ⚠ 问题 4：全量引入工具库。
 *
 * 本项目只用到了 _.get 和一个日期格式化。
 *
 * TODO-4: 改造并记录体积变化
 *   lodash → 按需引入（lodash/get）或手写
 *   moment → dayjs 或手写
 *
 * 思考：自己写这两个函数需要多少行？
 *       相比引入库，收益（体积）和代价（维护、边界处理）如何权衡？
 */
const dayjs = require('dayjs')

function get(obj, path, defaultValue) {
  // 目前用的是「假装很重」的实现，改造时替换成手写版本或 lodash/get
  const keys = String(path).split('.')
  let cur = obj
  for (const k of keys) {
    if (cur == null) return defaultValue
    cur = cur[k]
  }
  return cur === undefined ? defaultValue : cur
}

function formatDate(ts) {
  return dayjs(ts).format('YYYY-MM-DD HH:mm')
}

module.exports = { get, formatDate }
