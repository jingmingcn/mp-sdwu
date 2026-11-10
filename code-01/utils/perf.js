/** 简易打点工具：mark 记录时刻，measure 计算间隔。 */
const marks = new Map()

function mark(name) {
  marks.set(name, Date.now())
  return marks.get(name)
}

function measure(name, from) {
  const start = marks.get(from)
  if (start === undefined) {
    console.warn(`[perf] 未找到起点 ${from}`)
    return -1
  }
  const duration = Date.now() - start
  console.log(`[perf] ${name} = ${duration}ms`)
  return duration
}

/** 跑 n 次取中位数，抹平抖动 */
async function median(fn, n = 5) {
  const arr = []
  for (let i = 0; i < n; i++) arr.push(await fn())
  arr.sort((a, b) => a - b)
  return arr[Math.floor(arr.length / 2)]
}

module.exports = { mark, measure, median, marks }
