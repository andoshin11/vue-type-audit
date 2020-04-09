import { SourceMapConsumer } from 'source-map'
import { SourcemapEntry, TSVueFileName, Location, VueScriptFileName, CompiledVueTemplateFileName, VueTemplateFileName } from '../types'
import { isRawVueFile, isVueScriptFile, isCompiledVueTemplateFile, isVueTemplateFile, isTSVueFile } from '../helpers'

export function getOriginalPositionFor(
  fileName: TSVueFileName | VueScriptFileName | CompiledVueTemplateFileName | VueTemplateFileName,
  location: Location,
  sourcemapEntry: SourcemapEntry
): Location {
  // Note: TypeScript counts lines from 0, while sourcemap v3 treats lines with 1-basis.
  if (isTSVueFile(fileName)) {
    location = { line: location.line + 1, column: location.column }
  }
  
  const entry = sourcemapEntry.get(fileName)!
  const map = entry.map!

  const consumer = new SourceMapConsumer(map)
  const result = consumer.originalPositionFor(location)

  if (result) {
    const { source, line, column } = result

    if (isRawVueFile(source)) {
      // This block will be the final emit result.

      // Note: TypeScript counts lines from 0, while sourcemap v3 treats lines with 1-basis.
      return { line: line + 1, column: location.column }
    }

    if (isVueScriptFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line, column: location.column }, sourcemapEntry)
    }

    if (isCompiledVueTemplateFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line, column: location.column }, sourcemapEntry)
    }

    if (isVueTemplateFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line, column: location.column }, sourcemapEntry)
    }

    throw new Error('could not resolve position from sourcemap for ' + fileName)
  } else {
    throw new Error('could not resolve position from sourcemap for ' + fileName)
  }
}
