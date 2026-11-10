/**
 * 只测 stores —— 它不依赖任何 wx.* API，可以直接在 Node 里跑。
 * 这正是「状态层与平台解耦」的直接回报。
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/stores'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['stores/**/*.js', '!stores/**/__tests__/**'],
  coverageThreshold: {
    'stores/cart.js': { lines: 90, branches: 80 }
  }
}
