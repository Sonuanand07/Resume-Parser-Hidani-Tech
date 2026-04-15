module.exports = {
  testEnvironment: 'node',
  cacheDirectory: 'D:/jest-cache',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  forceExit: true,
  detectOpenHandles: true
};
