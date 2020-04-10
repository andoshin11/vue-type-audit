import _ts from 'typescript'
import { SourceMapGenerator, RawSourceMap } from 'source-map'
import { VueScriptFileName } from '../../types'
import { toTransformedVueScriptFileName } from '../../helpers'

const DefaultExportObjectRegEx = /export default/

export function transformScript(
  fileName: VueScriptFileName,
  content: string
) {
  const transformedVueScriptFileName = toTransformedVueScriptFileName(fileName)
  const gen = new SourceMapGenerator({ file: transformedVueScriptFileName })
  gen.setSourceContent(fileName, content)

  const hasDefaultExportObject = DefaultExportObjectRegEx.test(content)
  if (!hasDefaultExportObject) {
    throw new Error('could not find default exported object from script block')
  }

  const stripDefaultExport = content.replace(DefaultExportObjectRegEx, 'const __Component =')
  const transformed = stripDefaultExport

  transformed
    .split('\n')
    .forEach((_, index) => {
      gen.addMapping({
        source: fileName,
        original: { line: index + 1, column: 0 },
        generated: { line: index + 1, column: 0 }
      })
    })

  const map = JSON.parse(gen.toString()) as RawSourceMap
  return {
    transformed,
    map
  }
}
