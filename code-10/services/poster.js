const { getCtx, loadImage, loadRemote, ellipsis, wrapText, drawCircleImage, roundRect } = require('../utils/canvas')

/**
 * TODO-6: 绘制海报
 *
 * 元素：白底 → 商品主图 → 标题(最多两行) → 价格 → 圆形头像+昵称 → 小程序码 → 圆角卡片
 */
async function drawPoster(comp, { cover, title, priceInCent, qrcode, nickname, avatar }) {
  const { canvas, ctx, width: W, height: H } = await getCtx(comp, '#poster')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // TODO-6: 补全绘制逻辑

  return wx.canvasToTempFilePath({ canvas, destWidth: W * 2, destHeight: H * 2 })
}

/** TODO-9: 用离屏 canvas 重新实现一遍，并与页面内 canvas 对比 */
async function drawPosterOffscreen(data) {
  const canvas = wx.createOffscreenCanvas({ type: '2d', width: 300, height: 400 })
  const ctx = canvas.getContext('2d')
  // TODO-9
  return wx.canvasToTempFilePath({ canvas })
}

/**
 * TODO-8: 完整的保存流程（含授权与降级）
 *
 * 降级方案：拒绝授权时提供「长按图片保存」的引导
 * （<image show-menu-by-longpress />）
 */
async function saveToAlbum(tempFilePath) {
  return { saved: false, reason: 'TODO-8 未实现' }
}

module.exports = { drawPoster, drawPosterOffscreen, saveToAlbum }
