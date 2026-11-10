/**
 * Canvas 2D 工具。
 *
 * 最容易踩的坑：不按 DPR 放大 → 海报在高分屏上是糊的。
 */

/** TODO-1: 拿到 canvas 与 ctx，并按 DPR 缩放 */
async function getCtx(comp, selector) {
  const [res] = await new Promise(r =>
    comp.createSelectorQuery().select(selector)
      .fields({ node: true, size: true }).exec(r)
  )
  if (!res || !res.node) throw new Error('找不到 canvas 节点：' + selector)

  const canvas = res.node
  const ctx = canvas.getContext('2d')
  const dpr = wx.getWindowInfo().pixelRatio

  // ⚠ 对照实验：把下面三行注释掉，在 DPR=3 的手机上生成海报，截图对比清晰度
  canvas.width = res.width * dpr
  canvas.height = res.height * dpr
  ctx.scale(dpr, dpr)

  return { canvas, ctx, width: res.width, height: res.height, dpr }
}

/** TODO-2: 加载图片（本地路径与网络 URL 都要支持） */
function loadImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败: ' + src))
    img.src = src
  })
}

/**
 * TODO-3: 网络图先下载到本地再画（更稳，且能规避部分域名问题）
 *
 * 必做实验：直接用网络 URL 画图，
 * 在未配置 downloadFile 合法域名时会发生什么？记录错误信息。
 */
async function loadRemote(canvas, url) {
  const { tempFilePath } = await wx.downloadFile({ url })
  return loadImage(canvas, tempFilePath)
}

/** TODO-4: 单行截断（二分查找最长可容纳的前缀） */
function ellipsis(ctx, text, maxWidth) {
  if (!text) return ''
  if (ctx.measureText(text).width <= maxWidth) return text
  return text
}

/**
 * TODO-5: 多行换行（中英文混排）
 *   中文可以任意位置断行，英文单词不该被拆开。
 *   超出 maxLines 时最后一行加 '…'
 *
 * 测试用例：纯中文 / 纯英文 / 中英混排 / 含 emoji
 */
function wrapText(ctx, text, maxWidth, maxLines) {
  return [text]
}

/** TODO-7: 圆形头像 —— 注意 save/restore 成对，忘了 restore 后续绘制全被裁掉 */
function drawCircleImage(ctx, img, cx, cy, r) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
  ctx.restore()
}

/** 圆角矩形（roundRect 在部分基础库不可用，这里用 arcTo 实现） */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

module.exports = { getCtx, loadImage, loadRemote, ellipsis, wrapText, drawCircleImage, roundRect }
