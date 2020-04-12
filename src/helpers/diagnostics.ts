import _ts from 'typescript'
import { DiagnosticWithRange } from '../types'
import { isTSVueFile, toRawVueFileName } from './path'
import { pos2location, createSourceFile, location2pos } from './node'
import { SourcemapEntry } from '../types'
import { readSystemFile } from './file'
import { getOriginalPositionFor } from '../sourcemap'

export const hasDiagRange = (diagnostic: _ts.Diagnostic): diagnostic is DiagnosticWithRange => {
  const { start, length } = diagnostic
  return typeof start === 'number' && typeof length === 'number'
}

export const translateVuefileDiagnostic = (diagnostic: _ts.Diagnostic, sourcemapEntry: SourcemapEntry, ts: typeof _ts): _ts.Diagnostic => {
  const { file } = diagnostic

  if (!file || !isTSVueFile(file.fileName)) {
    throw new Error('Invalid diagnostic format')
  }

  // Do nothing if the diagnostic has no range
  if (!hasDiagRange(diagnostic)) {
    return diagnostic
  }

  // Update sourcefile
  const rawVueFileName = toRawVueFileName(file.fileName)
  const originalContent = readSystemFile(rawVueFileName)
  if (!originalContent) {
    throw new Error(`could not find file: ${rawVueFileName}`)
  }
  const sourcefile = createSourceFile(ts, originalContent, rawVueFileName)

  // Recover original position
  const { start, length } = diagnostic
  const content = file.getFullText()
  const startLC = pos2location(content, start)
  const endLC = pos2location(content, start + length)

  const originalStartLC = getOriginalPositionFor(file.fileName, startLC, sourcemapEntry)
  const originalEndLC = getOriginalPositionFor(file.fileName, endLC, sourcemapEntry)

  const originalStartPos = location2pos(originalContent, originalStartLC)
  const originalEndPos = location2pos(originalContent, originalEndLC)

  return {
    ...diagnostic,
    file: sourcefile,
    start: originalStartPos,
    length: originalEndPos - originalStartPos
  }
}
