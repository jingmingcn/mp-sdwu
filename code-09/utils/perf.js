const marks = new Map()
const records = []

const mark = name => { marks.set(name, Date.now()); return marks.get(name) }

function measure(name, from) {
  const start = marks.get(from)
  if (start === undefined) return -1
  const duration = Date.now() - start
  records.push({ name, duration, at: Date.now() })
  console.log(`[perf] ${name} = ${duration}ms`)
  return duration
}

/** TODO-1: 打印一张 before/after 对比表 */
function dumpReport(baseline = {}) {
  // 期望输出：
  // 指标            基线      当前      提升
  // 冷启动          3200ms    1400ms    2.3x
}

module.exports = { mark, measure, dumpReport, records }
