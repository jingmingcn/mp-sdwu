/** UI 自动化单独一份配置：慢、需要开发者工具、不进常规 CI */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.test.js'],
  testTimeout: 120000
}
