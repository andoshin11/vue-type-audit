import { SourceMapConsumer, LineRange } from 'source-map'
import { SourcemapEntry, TSVueFileName, Location, VueScriptFileName, CompiledVueTemplateFileName, VueTemplateFileName, RawVueFileName } from '../types'
import { isRawVueFile, isVueScriptFile, isCompiledVueTemplateFile, isVueTemplateFile, isTSVueFile, toVueTemplateFileName, toVueScriptFileName, toCompiledVueTemplateFileName, toTransformedCompiledVueTemplateFileName, toTSVueFIleName, toRawVueFileName } from '../helpers'

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
      // proxy column for a technical reason
      return { line: line - 1, column: location.column }
    }

    if (isVueScriptFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line: line, column: location.column }, sourcemapEntry)
    }

    if (isCompiledVueTemplateFile(source)) {
      // proxy column for a technical reason
      return getOriginalPositionFor(source, { line, column: location.column }, sourcemapEntry)
    }

    if (isVueTemplateFile(source)) {
      return getOriginalPositionFor(source, { line, column }, sourcemapEntry)
    }

    throw new Error('could not resolve position from sourcemap for ' + fileName)
  } else {
    throw new Error('could not resolve position from sourcemap for ' + fileName)
  }
}

export function getGeneratedPositionFor(
  fileName: RawVueFileName | CompiledVueTemplateFileName | VueTemplateFileName,
  location: Location,
  sourcemapEntry: SourcemapEntry
): Location {
  if (isRawVueFile(fileName)) {
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
        return { line: result.line, column: location.column }
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
        line: location.line + offset,
      }
      return result

    } else {
      throw new Error(`could not get generated position for: ${fileName} at ${location}`)
    }
  } else {
    throw new Error(`could not get generated position for: ${fileName} at ${location}`)
  }
}