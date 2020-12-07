import { SourceMapConsumer, LineRange } from 'source-map'
import { SourcemapEntry, TSVueFileName, Location, VueScriptFileName, CompiledVueTemplateFileName, VueTemplateFileName, RawVueFileName } from '../types'
import {
  isRawVueFile,
  isVueScriptFile,
  isCompiledVueTemplateFile,
  isVueTemplateFile,
  isTSVueFile,
  toVueTemplateFileName,
  toVueScriptFileName,
  toCompiledVueTemplateFileName,
  toTSVueFIleName,
  toRawVueFileName
} from '../helpers'

export function getOriginalPositionFor(
  fileName: TSVueFileName | VueScriptFileName | CompiledVueTemplateFileName | VueTemplateFileName,
  location: Location,
  sourcemapEntry: SourcemapEntry,
  retry: boolean = false
): Location {
  // console.log('recovering original position for: ' + fileName)
  // Note: TypeScript counts lines from 0, while sourcemap v3 treats lines with 1-basis.
  if (isTSVueFile(fileName)) {
    location = { line: location.line + 1, column: location.column }
  }
  
  const entry = sourcemapEntry.get(fileName)!
  const map = entry.map!

  const consumer = new SourceMapConsumer(map)
  const result = consumer.originalPositionFor(location)

  if (result && result.source) {
    const { source, line, column } = result

    if (isRawVueFile(source)) {
      // This block will be the final emit result.

      // Note: TypeScript counts lines from 0, while sourcemap v3 treats lines with 1-basis.
      // proxy column for a technical reason
      return { line: line - 1, column: location.column }
    }

    if (isVueScriptFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line: line, column: location.column }, sourcemapEntry)
    }

    if (isCompiledVueTemplateFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line, column: location.column }, sourcemapEntry, true)
    }

    if (isVueTemplateFile(source)) {
      return getOriginalPositionFor(source, { line, column }, sourcemapEntry)
    }

    throw new Error('could not resolve position from sourcemap for ' + fileName)
  } else {
    console.log('throwing error for: '+ fileName)
    console.log(JSON.stringify(location))
    if (retry) {
      return getOriginalPositionFor(fileName, { ...location, line: location.line - 2 }, sourcemapEntry)
    }
    throw new Error('could not resolve position from sourcemap for ' + fileName)
  }
}

export function getGeneratedPositionFor(
  fileName: RawVueFileName | CompiledVueTemplateFileName | VueTemplateFileName,
  location: Location,
  sourcemapEntry: SourcemapEntry
): Location {
  if (isRawVueFile(fileName)) {

    // Note: TS Server counts lines from 0, while sourcemap v3 treats lines with 1-basis.
    location = { line: location.line + 1, column: location.column }

    // determin block
    const script = sourcemapEntry.get(toVueScriptFileName(fileName))
    if (script) {
      const consumer = new SourceMapConsumer(script.map!)
      const result = consumer.generatedPositionFor({
        source: fileName,
        ...location
      })
      // forward column due to technical resons
      if (result.line !== null && result.column !== null) {
        // for script file, this result eqauls to final result
        // Note: TypeScript counts lines from 0, while sourcemap v3 treats lines with 1-basis.
        return { line: result.line - 1, column: location.column }
      }
    }

    const template = sourcemapEntry.get(toVueTemplateFileName(fileName))
    if (template) {
      const consumer = new SourceMapConsumer(template.map!)
      const result = consumer.generatedPositionFor({
        source: fileName,
        ...location
      })
      // forward column due to technical resons
      if (result.line !== null && result.column !== null) {
        return getGeneratedPositionFor(toVueTemplateFileName(fileName), { line: result.line, column: location.column }, sourcemapEntry)
      }
    }

    throw new Error(`could not get generated position for: ${fileName} at ${location}`)
  } else if (isVueTemplateFile(fileName)) {
    const compiledVueTemplateFileName = toCompiledVueTemplateFileName(fileName)
    const entry = sourcemapEntry.get(compiledVueTemplateFileName)!
    const consumer = new SourceMapConsumer(entry.map!)
    const result = consumer.generatedPositionFor({
      source: fileName,
      ...location
    })

    return getGeneratedPositionFor(compiledVueTemplateFileName, { line: result.line, column: result.column }, sourcemapEntry)
  } else if (isCompiledVueTemplateFile(fileName)) {
    const rawVueFileName = toRawVueFileName(fileName)
    const tsVueFileName = toTSVueFIleName(rawVueFileName)
    const entry = sourcemapEntry.get(tsVueFileName)!
    const map = entry.map!

    // manually calculate offset
    if (map && 'sections' in map) {
      // @ts-expect-error
      const sections = map.sections
      const templateSection = sections[1]
      const offset = templateSection.offset.line
      const result = {
        ...location,
        // Note: TypeScript counts lines from 0, while sourcemap v3 treats lines with 1-basis.
        line: location.line + offset - 1,
      }
      return result

    } else {
      throw new Error(`could not get generated position for: ${fileName} at ${location}`)
    }
  } else {
    throw new Error(`could not get generated position for: ${fileName} at ${location}`)
  }
}