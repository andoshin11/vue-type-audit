import _ts from 'typescript'
import * as fs from 'fs'
import { RawVueFileName, SourcemapEntry } from '../types'
import { transformScript, parseExternalComponentsFromScrtipContent, parseEventNamesFromScrtipContent } from './script'
import { transformTemplate } from './template'
import { toVueScriptFileName, toTSVueFIleName, toVueTemplateFileName, toCompiledVueTemplateFileName } from '../helpers'
import { createTypeHelpers } from './createTypeHelpers'
import { parseBlocks } from './parseBlocks'

export function transformVueFile(
  fileName: RawVueFileName,
  content: string,
  sourcemapEntry: SourcemapEntry,
  ts: typeof _ts
) {
  const tsVueFileName = toTSVueFIleName(fileName)
  const vueScriptFileName = toVueScriptFileName(fileName)
  const vueTemplateFileName = toVueTemplateFileName(fileName)
  const compiledVueTemplateFileName = toCompiledVueTemplateFileName(vueTemplateFileName)
  const { scriptContent, templateContent } = parseBlocks(fileName, content, sourcemapEntry)

  /**
   * Create outputs
   */
  const scriptBlock = transformScript(vueScriptFileName, scriptContent)
  const templateBlock = transformTemplate(compiledVueTemplateFileName, templateContent)

  const externalComponents = parseExternalComponentsFromScrtipContent(scriptContent, ts)
  const eventNames = parseEventNamesFromScrtipContent(scriptContent, ts)
  const typeHelpersBlock = createTypeHelpers(externalComponents, eventNames)

  const scriptBlockLinesNum = scriptBlock.transformed.split('\n').length
  const typeHelpersBlockLinesNum = typeHelpersBlock.split('\n').length

  const map = {
    version: '3',
    file: tsVueFileName,
    sections: [
      {
        offset: {
          line: 0,
          column: 0
        },
        map: scriptBlock.map
      },
      {
        offset: {
          line: scriptBlockLinesNum + typeHelpersBlockLinesNum,
          column: 0
        },
        map: templateBlock.map
      }
    ]
  } as any

  sourcemapEntry.set(tsVueFileName, { map })

  const output = [scriptBlock.transformed, typeHelpersBlock, templateBlock.transformed].join('\n')
  // fs.writeFileSync(toTSVueFIleName(fileName), output)

  return {
    transformedContent: output
  }
}
