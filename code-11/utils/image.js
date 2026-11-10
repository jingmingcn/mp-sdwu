let _dpr = 0
const dpr = () => (_dpr || (_dpr = wx.getWindowInfo().pixelRatio || 2))

/**
 * 云存储集成了图片处理能力（类似 CDN 的 imageView）。
 *
 * 必做：列表里的图一律加尺寸参数 ——
 * 原图直出会让流量费用与加载时间都失控。
 */
function imgUrl(base, width) {
  if (!base) return ''
  const w = Math.ceil(width * dpr())
  const sep = base.indexOf('?') >= 0 ? '&' : '?'
  return `${base}${sep}imageView2/2/w/${w}/format/webp/q/80`
}

module.exports = { imgUrl, dpr }
