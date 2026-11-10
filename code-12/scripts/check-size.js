#!/usr/bin/env node
/**
 * 体积红线。
 *
 * 真实项目里应该用 miniprogram-ci 上传结果里的 subPackageInfo，
 * 这里在没有上传密钥时用「源码目录体积」做近似，保证本地也能跑。
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MP = path.join(ROOT, 'miniprogram')

const LIMITS = {
  main: 1.8 * 1024 * 1024,
  total: 18 * 1024 * 1024
}

const IGNORE = new Set(['node_modules', 'miniprogram_npm', '.git'])

function dirSize(dir) {
  let total = 0
  if (!fs.existsSync(dir)) return 0
  for (const name of fs.readdirSync(dir)) {
    if (IGNORE.has(name)) continue
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    total += st.isDirectory() ? dirSize(full) : st.size
  }
  return total
}

/** 分包目录约定以 package 开头 */
function subpackages() {
  if (!fs.existsSync(MP)) return []
  return fs
    .readdirSync(MP)
    .filter(n => n.indexOf('package') === 0 && fs.statSync(path.join(MP, n)).isDirectory())
    .map(n => ({ name: n, size: dirSize(path.join(MP, n)) }))
}

const kb = n => (n / 1024).toFixed(1) + ' KB'

const total = dirSize(MP)
const subs = subpackages()
const main = total - subs.reduce((s, p) => s + p.size, 0)

console.log('\n包体积：')
console.log(`  主包    ${kb(main)}   (红线 ${kb(LIMITS.main)})`)
subs.forEach(p => console.log(`  ${p.name.padEnd(8)}${kb(p.size)}`))
console.log(`  总计    ${kb(total)}   (红线 ${kb(LIMITS.total)})\n`)

const errors = []
if (main > LIMITS.main) errors.push(`主包 ${kb(main)} 超过红线 ${kb(LIMITS.main)}`)
if (total > LIMITS.total) errors.push(`总包 ${kb(total)} 超过红线 ${kb(LIMITS.total)}`)

if (errors.length) {
  errors.forEach(e => console.error('✗ ' + e))
  process.exit(1)
}
console.log('✓ 体积检查通过\n')
