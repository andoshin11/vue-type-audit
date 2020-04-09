import _ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { FileEntry, SourcemapEntry } from './types'
import { createHost, createService } from './languageService'
import { Reporter } from './reporter'

export class ProxyService {
  private tsService: _ts.LanguageService

  reporter: Reporter
  scriptVersions: FileEntry = new Map()
  sourcemapEntry: SourcemapEntry = new Map()

  constructor(public fileNames: string[], private compilerOptions: _ts.CompilerOptions, ts: typeof _ts) {
    const host = createHost(fileNames, compilerOptions, this.scriptVersions, this.sourcemapEntry, ts)
    this.tsService = createService(host, ts)
    this.reporter = new Reporter(this.sourcemapEntry)
  }

  static fromConfigFile(configPath: string, ts: typeof _ts): ProxyService {
    const content = fs.readFileSync(configPath).toString();
    const parsed = ts.parseJsonConfigFileContent(
        JSON.parse(content),
        ts.sys,
        path.dirname(configPath)
    );
    const compilerOptions = parsed.options
    const fileNames = parsed.fileNames

    return new ProxyService(fileNames, compilerOptions, ts)
  }

  getSemanticDiagnostics() {
    const { tsService } = this
    const result = tsService.getProgram()!.getSemanticDiagnostics()
    return [...result]
  }
}
