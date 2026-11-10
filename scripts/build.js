#!/usr/bin/env node
/**
 * 批量导出课件。
 *
 * marp-cli 在一次调用里处理多个文件时不允许指定 --output，
 * 所以这里逐个文件调用，输出到 dist/。
 *
 *   node scripts/build.js html            # 导出全部
 *   node scripts/build.js pdf ch-03.md    # 只导出指定文件
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const FORMATS = { html: [], pdf: ['--pdf'], pptx: ['--pptx'] }

const [, , format = 'html', ...files] = process.argv
if (!FORMATS[format]) {
  console.error(`未知格式: ${format}（可用: ${Object.keys(FORMATS).join(', ')}）`)
  process.exit(1)
}

const targets = files.length
  ? files
  : fs.readdirSync(ROOT).filter(f => /^(ch|lab)-\d+\.md$/.test(f)).sort()

if (!targets.length) {
  console.error('没有找到 ch-*.md / lab-*.md')
  process.exit(1)
}

fs.mkdirSync(DIST, { recursive: true })

const marp = path.join(ROOT, 'node_modules', '.bin', 'marp')
let failed = 0

for (const file of targets) {
  const out = path.join(DIST, path.basename(file, '.md') + '.' + format)
  process.stdout.write(`→ ${file} … `)
  try {
    execFileSync(marp, [...FORMATS[format], '--output', out, file], {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'pipe']
    })
    console.log('ok')
  } catch (e) {
    failed++
    console.log('失败')
    console.error(String(e.stderr || e.message).trim())
  }
}

console.log(`\n完成：${targets.length - failed}/${targets.length} → dist/`)
process.exit(failed ? 1 : 0)
