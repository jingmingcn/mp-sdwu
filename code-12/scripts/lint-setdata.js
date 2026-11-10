#!/usr/bin/env node
/**
 * 项目特定的静态检查。
 *
 * 思路：把团队踩过的坑固化成脚本，比写在文档里靠人记有效得多。
 *
 * ⚠ 正则匹配必然有误报。请在报告里评估你的规则的误报率，并说明如何降低。
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const TARGET = path.join(ROOT, 'miniprogram')

// TODO-2: 实现至少 5 条项目特定的检查
const RULES = [
  {
    name: 'no-date-in-setdata',
    re: /setData\([^)]*new Date\(/,
    msg: 'setData 不能传 Date 对象（会被序列化成字符串，模板里无法调用方法）'
  },
  {
    name: 'no-setdata-in-created',
    re: /created\s*\([\s\S]{0,400}?setData/,
    msg: 'created 中不能 setData（此时组件还未进入节点树）'
  }
  // TODO-2: 再加至少 3 条，例如：
  //   - 组件里直接 setData 修改 properties（绕过单向数据流）
  //   - 循环体内调用 setData（应先攒成一个对象）
  //   - wx.getStorageSync 出现在 app.js 顶层（阻塞启动）
]

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'miniprogram_npm') continue
    const full = path.join(dir, name)
    fs.statSync(full).isDirectory() ? walk(full, cb) : cb(full)
  }
}

let failed = 0
const hits = []

walk(TARGET, file => {
  if (!file.endsWith('.js')) return
  const src = fs.readFileSync(file, 'utf8')
  const lines = src.split('\n')

  RULES.forEach(rule => {
    if (!rule.re.test(src)) return
    // 定位到具体行号，便于点击跳转
    const lineNo = lines.findIndex(l => rule.re.test(l)) + 1
    hits.push({
      file: path.relative(ROOT, file),
      line: lineNo > 0 ? lineNo : 1,
      rule: rule.name,
      msg: rule.msg
    })
    failed++
  })
})

if (hits.length) {
  console.error('\n自定义检查未通过：\n')
  hits.forEach(h => console.error(`  ${h.file}:${h.line}  [${h.rule}] ${h.msg}`))
  console.error('')
} else {
  console.log('✓ 自定义检查通过')
}

process.exit(failed ? 1 : 0)
