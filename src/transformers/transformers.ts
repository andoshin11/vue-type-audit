import _ts from 'typescript'
import { RawVueFileName, SourcemapEntry } from '../types'
import { transformScript } from './script'
import { transformTemplate } from './template'
import { toVueScriptFileName, toTSVueFIleName, toVueTemplateFileName, toCompiledVueTemplateFileName } from '../helpers'

export function createTSVueFile(
  fileName: RawVueFileName,
  scriptContent: string,
  templateContent: string | undefined,
  sourcemapEntry: SourcemapEntry
) {
  const tsVueFileName = toTSVueFIleName(fileName)
  const preparationBlock = createPreparationBlock()

  const vueScriptFileName = toVueScriptFileName(fileName)
  const scriptBlock = transformScript(vueScriptFileName, scriptContent, _ts)

  const vueTemplateFileName = toVueTemplateFileName(fileName)
  const compiledVueTemplateFileName = toCompiledVueTemplateFileName(vueTemplateFileName)
  const templateBlock = transformTemplate(compiledVueTemplateFileName, templateContent)

  const preparationBlockLinesNum = preparationBlock.split('\n').length
  const scriptBlockLinesNum = preparationBlockLinesNum + 1 + scriptBlock.transformed.split('\n').length

  const map = {
    version: '3',
    file: tsVueFileName,
    sections: [
      // script block
      {
        offset: {
          line: preparationBlockLinesNum,
          column: 0
        },
        map: scriptBlock.map
      },
      // template block
      {
        offset: {
          line: scriptBlockLinesNum,
          column: 0
        },
        map: templateBlock.map
      }
    ]
  } as any

  sourcemapEntry.set(tsVueFileName, { map })

  return preparationBlock + '\n' + scriptBlock.transformed + '\n' + templateBlock.transformed
}

function createPreparationBlock() {
  return 'import { ClassInstance, __createVNodeFromExternalComponent, _VNodeProps, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data } from "__GLOBAL_TYPES";'
}
