#!/usr/bin/env node
/**
 * 组件包构建：src/ → miniprogram_dist/
 *
 * 为什么需要完整性校验：
 *   漏掉 .wxml 时构建 npm 不会报错，但使用方渲染出来是空白 —— 非常难排查。
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const DIST = path.join(ROOT, 'miniprogram_dist')

const COPY_EXT = ['.js', '.json', '.wxml', '.wxss', '.wxs']

// TODO-8: 实现 build
//   1. 清空 DIST
//   2. 递归拷贝 SRC 下 COPY_EXT 里的文件
//   3. 生成 DIST/index.js，导出所有组件路径常量
//   4. 校验：每个「组件目录」必须同时有 index.js / index.json / index.wxml
//      缺失就报错并 process.exit(1)

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function walk(dir, cb) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full, cb)
    else cb(full)
  }
}

function copyAll() {
  // TODO
}

/** 一个目录只要含 index.json 且里面 component:true，就算组件目录 */
function findComponentDirs() {
  const dirs = []
  walk(SRC, file => {
    if (path.basename(file) !== 'index.json') return
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (json.component) dirs.push(path.dirname(file))
    } catch (e) { /* 忽略非组件 json */ }
  })
  return dirs
}

function validate() {
  // TODO: 对每个组件目录校验三件套是否齐全
}

function genIndex() {
  // TODO: 生成 miniprogram_dist/index.js
  // 形如：module.exports = { StarRating: 'star-rating/index', Tabs: 'tabs/index', ... }
}

function build() {
  rmrf(DIST)
  fs.mkdirSync(DIST, { recursive: true })
  copyAll()
  validate()
  genIndex()
  console.log('✓ 构建完成 →', path.relative(ROOT, DIST))
}

build()
