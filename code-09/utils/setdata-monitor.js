/**
 * 劫持 setData，统计次数与字节数。
 * 在页面/组件的 attached 里调用。
 */
function monitorSetData(ctx, label = 'page') {
  const origin = ctx.setData.bind(ctx)
  const stat = { count: 0, bytes: 0, max: 0, maxKeys: '' }

  ctx.setData = (data, cb) => {
    const bytes = JSON.stringify(data).length
    stat.count++
    stat.bytes += bytes
    if (bytes > stat.max) { stat.max = bytes; stat.maxKeys = Object.keys(data).join(',') }
    if (bytes > 64 * 1024) {
      console.warn(`[setData] ⚠ ${label} 单次 ${(bytes / 1024).toFixed(1)}KB 超过 64KB`, Object.keys(data))
    }
    return origin(data, cb)
  }

  ctx.__setDataStat = stat
  return stat
}

function dumpSetData(ctx, label = 'page') {
  const s = ctx.__setDataStat
  if (!s) return
  console.log(`[setData] ${label} 共 ${s.count} 次 / ${(s.bytes / 1024).toFixed(1)}KB，` +
    `最大单次 ${(s.max / 1024).toFixed(1)}KB (${s.maxKeys})`)
}

module.exports = { monitorSetData, dumpSetData }
