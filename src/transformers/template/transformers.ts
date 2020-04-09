import _ts from 'typescript'
import { SourceMapGenerator, RawSourceMap } from 'source-map'
import { CompiledVueTemplateFileName } from '../../types'
import { toTransformedCompiledVueTemplateFileName } from '../../helpers'

export function transformTemplate(
  fileName: CompiledVueTemplateFileName,
  content: string
) {
  const transformedCompiledVueTemplateFileName = toTransformedCompiledVueTemplateFileName(fileName)
  const gen = new SourceMapGenerator({ file: transformedCompiledVueTemplateFileName })
  gen.setSourceContent(fileName, content)

  // escape overridden identifiers
  let transformed = content
  transformed = transformed.replace(/_createVNode/, '#createVNode')
  transformed = transformed.replace(/_resolveComponent/, '#resolveComponent')

  // strip export assignment
  transformed = transformed.replace('export function render(_ctx, _cache)', 'function render(_ctx: __ComponentType)')

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
