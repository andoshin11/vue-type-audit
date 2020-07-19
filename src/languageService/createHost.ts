import _ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { FileEntry, SourcemapEntry, RawVueFileName } from '../types'
import { transformVueFile } from '../transformers'
import { GLOBAL_TYPES_FILE } from '../asset'
import {
  isRawVueFile,
  isTSVueFile,
  toRawVueFileName,
  toTSVueFIleName,
  getFullTextFromSnapshot,
  readSystemFile
} from '../helpers'

/**
 * TypeScript Language Service Host with these custome features
 *
 * 1. Speeding up file access with injected document registry
 * 2. Load GLOBAL_TYPES_FILE
 * 3. Load `.vue` files as virtual TS files
 */
export const createHost = (fileNames: string[], compilerOptions: _ts.CompilerOptions, fileEntry: FileEntry, sourcemapEntry: SourcemapEntry, ts: typeof _ts): _ts.LanguageServiceHost => {
  // Register GLOBAL_TYPES_FILE
  fileNames = [...fileNames, GLOBAL_TYPES_FILE.name]

  const getCurrentVersion = (fileName: string) => fileEntry.has(fileName) ? fileEntry.get(fileName)!.version : 0

  const readSystemFileWithFallback = (
    filePath: string,
    encoding?: string | undefined
  ) => {
    return ts.sys.readFile(filePath, encoding) || readSystemFile(filePath, encoding)
  }

  const moduleResolutionHost: _ts.ModuleResolutionHost = {
    fileExists: fileName => {
      return ts.sys.fileExists(fileName) || readSystemFile(fileName) !== undefined
    },
    readFile: fileName => {
      if (fileName === GLOBAL_TYPES_FILE.name) {
        return GLOBAL_TYPES_FILE.content
      }

      if (fileEntry.has(fileName)) {
        const snapshot = fileEntry.get(fileName)!.scriptSnapshot
        return getFullTextFromSnapshot(snapshot)
      }
      return readSystemFileWithFallback(fileName)
    },
    realpath: ts.sys.realpath,
    directoryExists: ts.sys.directoryExists,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getDirectories: ts.sys.getDirectories
  }

  const host: _ts.LanguageServiceHost = {
    getScriptFileNames: () => fileNames,
    getScriptVersion: fileName => getCurrentVersion(fileName) + '',
    getScriptSnapshot: fileName => {
      // recover file name
      if (isTSVueFile(fileName)) {
        fileName = toRawVueFileName(fileName)
      }

      if (fileEntry.has(fileName)) return fileEntry.get(fileName)!.scriptSnapshot

      if (fileName === GLOBAL_TYPES_FILE.name) {
        const scriptSnapshot = ts.ScriptSnapshot.fromString(GLOBAL_TYPES_FILE.content)
        fileEntry.set(fileName, { version: 0, scriptSnapshot })
        return scriptSnapshot
      }

      if (!fs.existsSync(fileName)) {
        return undefined
      }
      let content = readSystemFile(fileName)!

      if (isRawVueFile(fileName)) {
        content = transformVueFile(fileName, content, sourcemapEntry, ts)
        // fs.writeFileSync(fileName + '.ts', content)
      }

      const scriptSnapshot = ts.ScriptSnapshot.fromString(content)
      fileEntry.set(fileName, { version: 0, scriptSnapshot })
      return scriptSnapshot
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    resolveModuleNames: (moduleNames, containingFile, _, __, options) => {
      const ret: (_ts.ResolvedModule | undefined)[] = moduleNames.map(name => {
        if (name === GLOBAL_TYPES_FILE.identifier) {
          const resolved: _ts.ResolvedModule = {
            resolvedFileName: GLOBAL_TYPES_FILE.name
          }
          return resolved
        }

        if (isRawVueFile(name)) {
          const absPath = path.resolve(path.dirname(containingFile), name) as RawVueFileName
          const resolved: _ts.ResolvedModule = {
            resolvedFileName: toTSVueFIleName(absPath)
          }
          return resolved
        }

        const { resolvedModule } = ts.resolveModuleName(
            name,
            containingFile,
            options,
            moduleResolutionHost
        );
        return resolvedModule
      });
      return ret;
    },
    fileExists: moduleResolutionHost.fileExists,
    readFile: moduleResolutionHost.readFile,
    readDirectory: ts.sys.readDirectory,
    getDirectories: ts.sys.getDirectories,
    realpath: moduleResolutionHost.realpath
  }

  return host
}
