import _ts from 'typescript'
import commander from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import { ProxyService } from '../proxyService'

const pkg = require('../../package.json')

function loadTS(currentDir: string) {
  const tsPath = path.resolve(currentDir, './node_modules/typescript/lib/typescript.js')

  let ts: typeof _ts

  if (fs.existsSync(tsPath)) {
    const tsModule = path.resolve(currentDir, './node_modules/typescript')
    ts = require(path.relative(__dirname, tsModule))
  } else {
    // fallback
    ts = require('typescript')
  }

  return ts
}

commander
  .version(pkg.version)
  .command('run')
  .action(async () => {
    try {
      const currentDir = process.cwd()
      const configPath = path.resolve(currentDir, 'tsconfig.json')
      if (!fs.existsSync(configPath)) {
        throw new Error(`could not find tsconfig.json at: ${currentDir}`)
      }

      const localTS = loadTS(currentDir)
      const service = ProxyService.fromConfigFile(configPath, localTS)
      const diagnostics = service.getSemanticDiagnostics()
      service.reporter.reportDiagnostics(diagnostics)
      service.reporter.reportDiagnosticsSummary(diagnostics)

    } catch (e) {
      throw e
    }
  })

commander.parse(process.argv)
