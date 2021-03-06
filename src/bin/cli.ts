import _ts from 'typescript'
import commander from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import { Service } from '../service'

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
  .option('-d, --debug', 'output extra debugging')
  .action(async (args) => {
    try {
      const currentDir = process.cwd()
      const configPath = path.resolve(currentDir, 'tsconfig.json')
      if (!fs.existsSync(configPath)) {
        throw new Error(`could not find tsconfig.json at: ${currentDir}`)
      }

      const isDebug = !!args.debug
      const localTS = loadTS(currentDir)
      const service = Service.fromConfigFile(configPath, localTS, isDebug)
      const diagnostics = service.getSemanticDiagnostics()
      service.reporter.reportDiagnostics(diagnostics)
      service.reporter.reportDiagnosticsSummary(diagnostics)

    } catch (e) {
      throw e
    }
  })

commander.parse(process.argv)
