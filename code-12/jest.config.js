module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/miniprogram'],
  testMatch: ['**/__tests__/**/*.test.js', '**/tests/unit/**/*.test.js', '**/tests/component/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-after-env.js'],
  collectCoverageFrom: [
    'miniprogram/utils/**/*.js',
    'miniprogram/stores/**/*.js',
    'miniprogram/services/**/*.js',
    'miniprogram/request/**/*.js',
    '!**/__tests__/**',

    // TODO-6~11 完成后，把下面三行删掉 —— 它们是还没实现的模块，
    // 暂时排除是为了让基线 CI 是绿的。补完实现与测试后必须重新纳入统计。
    '!miniprogram/utils/report.js',
    '!miniprogram/utils/logger.js',
    '!miniprogram/services/feature.js'
  ],
  // 覆盖率不达标会让 jest 退出码非 0，CI 随之失败
  coverageThreshold: {
    global: { lines: 80, branches: 70, functions: 80 }
  }
}
