const defaultConfig = require('./jest.config')

module.exports = {
  ...defaultConfig,
  testRegex: "(test/e2e/.*\\.test)\\.ts$"
}
