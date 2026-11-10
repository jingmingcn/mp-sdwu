#!/usr/bin/env node
/**
 * 用 miniprogram-ci 上传体验版。
 *
 * 前置：
 *   MP 后台 → 开发管理 → 开发设置 → 小程序代码上传密钥
 *   下载 private.<appid>.key，**放到项目外**，用环境变量指向它
 *   同时配置 IP 白名单（CI 机器的出口 IP）
 *
 * ⚠ private.*.key 绝不能提交进仓库。
 */
const path = require('path')
const { execSync } = require('child_process')

// TODO-19: 实现上传
// 1. 从 git 取当前 branch 与 short hash，拼进 desc
// 2. version 取自 package.json
// 3. 先 ci.packNpm() 再 ci.upload()
// 4. ignores 要排除 tests / scripts / node_modules
// 5. robot 从环境变量读，默认 1（每条流水线用不同 robot，避免冲突）
// 6. 打印各分包大小

const ROOT = path.resolve(__dirname, '..')
const { version } = require('../package.json')

function git(cmd, fallback) {
  try {
    return execSync(cmd, { cwd: ROOT }).toString().trim()
  } catch (e) {
    return fallback
  }
}

/** TODO-20: 体积红线 —— 主包 > 1.8MB 或总包 > 18MB 时抛错，让 CI 失败 */
function assertSize(subPackageInfo) {
  const find = name => (subPackageInfo || []).find(p => p.name === name)
  const main = find('__APP__')
  const full = find('__FULL__')

  if (main) console.log(`主包 ${(main.size / 1024).toFixed(1)} KB`)
  if (full) console.log(`总包 ${(full.size / 1024).toFixed(1)} KB`)

  // TODO-20
}

async function main() {
  const ci = require('miniprogram-ci')

  const appid = process.env.WX_APPID
  const privateKeyPath = process.env.WX_PRIVATE_KEY_PATH
  if (!appid || !privateKeyPath) {
    console.error('缺少环境变量 WX_APPID / WX_PRIVATE_KEY_PATH')
    process.exit(1)
  }

  const branch = git('git rev-parse --abbrev-ref HEAD', 'unknown')
  const commit = git('git rev-parse --short HEAD', 'nogit')

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath: path.join(ROOT, 'miniprogram'),
    privateKeyPath,
    ignores: ['node_modules/**/*', 'tests/**/*', 'scripts/**/*', '**/__tests__/**']
  })

  await ci.packNpm(project, { reporter: info => console.log('构建 npm:', info) })

  const result = await ci.upload({
    project,
    version,
    desc: `${branch}@${commit} · ${new Date().toLocaleString('zh-CN')}`,
    setting: { es6: true, es7: true, minify: true, autoPrefixWXSS: true },
    robot: Number(process.env.CI_ROBOT || 1),
    onProgressUpdate: () => {}
  })

  console.log(`✓ 上传成功 v${version}`)
  assertSize(result.subPackageInfo)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
