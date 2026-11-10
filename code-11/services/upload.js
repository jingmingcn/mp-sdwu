const { imgUrl } = require('../utils/image')

/**
 * TODO-12: 上传前压缩
 *
 * 为什么必须压：手机拍的原图 3–8MB，弱网下上传要 30s 以上，用户会直接退出。
 * 压到 1080px / quality 80 通常在 200–400KB，视觉无差别。
 */
async function compress(filePath) {
  const info = await wx.getImageInfo({ src: filePath })
  if (info.width <= 1080) return filePath
  const { tempFilePath } = await wx.compressImage({ src: filePath, quality: 80, compressedWidth: 1080 })
  return tempFilePath
}

/**
 * TODO-13: 上传到云存储
 *
 * cloudPath 必须分层：messages/{openid}/{yyyymm}/{uuid}.jpg
 * 好处：不会互相覆盖、可按前缀批量清理、控制台里能看懂、配合权限做隔离。
 */
async function uploadImage(filePath, openid) {
  return ''
}

/** TODO-14: 批量上传（最多 9 张），带并发限制与进度 */
async function uploadImages(filePaths, onProgress) {
  return []
}

/** TODO-16: fileID → 带裁剪参数的临时 URL */
async function toThumbUrl(fileID, width = 300) {
  const { fileList } = await wx.cloud.getTempFileURL({ fileList: [fileID] })
  const url = fileList[0] && fileList[0].tempFileURL
  return url ? imgUrl(url, width) : ''
}

async function toThumbUrls(fileIDs, width = 300) {
  if (!fileIDs || !fileIDs.length) return []
  const { fileList } = await wx.cloud.getTempFileURL({ fileList: fileIDs })
  return fileList.map(f => (f.tempFileURL ? imgUrl(f.tempFileURL, width) : ''))
}

module.exports = { compress, uploadImage, uploadImages, toThumbUrl, toThumbUrls }
