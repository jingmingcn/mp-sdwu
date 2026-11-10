/**
 * 统一日志。
 *
 * 输出格式：[+123ms][App] onLaunch
 *   +123ms —— 距 App 启动的毫秒数，用于观察生命周期时序
 *
 * 约束：本文件不允许调用任何 wx.* API（为了第十二章能直接单测）。
 */
const { DEBUG } = require('../config')

const T0 = Date.now()

function stamp() {
  // TODO-2: 返回形如 '[+123ms]' 的字符串
  //   提示：Date.now() - T0
  return ''
}

function log(scope, ...args) {
  // TODO-3: DEBUG 为真时输出 stamp() + `[${scope}]` + args
  //   DEBUG 为假时静默
}

function warn(scope, ...args) {
  if (!DEBUG) return
  console.warn(stamp(), `[${scope}]`, ...args)
}

function error(scope, ...args) {
  // error 无论 DEBUG 与否都要输出
  console.error(stamp(), `[${scope}]`, ...args)
}

module.exports = { log, warn, error, stamp, T0 }
