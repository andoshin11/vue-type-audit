import { Service } from '../../src/service'

export function createServiceForTest(configPath: string) {
  const localTS = require('../../node_modules/typescript')
  const service = Service.fromConfigFile(configPath, localTS)
  return service
}
