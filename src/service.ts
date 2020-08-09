import _ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { FileEntry, SourcemapEntry } from './types'
import { createHost, createService } from './languageService'
import { Reporter } from './reporter'
import { isTSVueFile, translateTSVuefileDiagnostic } from './helpers'
import { Logger } from './logger'

export class Service {
  private tsService: _ts.LanguageService
  private logger: Logger

  reporter: Reporter
  scriptVersions: FileEntry = new Map()
  sourcemapEntry: SourcemapEntry = new Map()

  constructor(public fileNames: string[], private compilerOptions: _ts.CompilerOptions, private ts: typeof _ts, debug: boolean = false) {
    const host = createHost(fileNames, compilerOptions, this.scriptVersions, this.sourcemapEntry, ts)
    this.tsService = createService(host, ts)
    this.reporter = new Reporter()
    this.logger = new Logger(debug ? 'info' : 'silent')
  }

  static fromConfigFile(configPath: string, ts: typeof _ts, debug: boolean = false): Service {
    const content = fs.readFileSync(configPath).toString();
    const parsed = ts.parseJsonConfigFileContent(
        JSON.parse(content),
        ts.sys,
        path.dirname(configPath)
    );
    const compilerOptions = parsed.options
    const fileNames = parsed.fileNames

    return new Service(fileNames, compilerOptions, ts, debug)
  }

  getSemanticDiagnostics() {
    const { ts, sourcemapEntry, tsService } = this
    const program = tsService.getProgram()
    if (!program) {
      throw new Error('could not create TS Program')
    }
    const typeChecker = program.getTypeChecker()

    const nativeSemanticDiagnostics = this.getNativeSemanticDiagnostics()

    // Tweak diagnostics for Vue files.
    const actualDiagnostics = nativeSemanticDiagnostics.map(d => {
      if (!d.file || !isTSVueFile(d.file.fileName)) return d

      return translateTSVuefileDiagnostic(d, sourcemapEntry, typeChecker, ts, this.logger)
    })

    return actualDiagnostics
  }

  getNativeSemanticDiagnostics() {
    const { tsService } = this
    const result = tsService.getProgram()!.getSemanticDiagnostics()
    return [...result]
  }
}
