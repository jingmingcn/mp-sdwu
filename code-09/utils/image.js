/**
 * TODO-3: 实现 imgUrl(base, width)
 *
 * 按 pixelRatio 算出实际需要的像素宽度，拼上 CDN 裁剪参数与 webp。
 *
 * 例如：imgUrl('https://cdn.x.com/a.jpg', 200)
 *   在 DPR=3 的手机上应产出
 *   https://cdn.x.com/a.jpg?imageView2/2/w/600/format/webp/q/80
 */
let _dpr = 0

function dpr() {
  if (!_dpr) _dpr = wx.getWindowInfo().pixelRatio || 2
  return _dpr
}

function imgUrl(base, width) {
  if (!base) return ''
  return base
}

module.exports = { imgUrl, dpr }
