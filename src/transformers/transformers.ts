import _ts from 'typescript'
import * as fs from 'fs'
import { parse as parseComponent } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import { RawVueFileName, SourcemapEntry } from '../types'
import { transformScript } from './script'
import { transformTemplate } from './template'
import { toVueScriptFileName, toTSVueFIleName, toVueTemplateFileName, toCompiledVueTemplateFileName } from '../helpers'

export function transformVueFile(
  fileName: RawVueFileName,
  content: string,
  sourcemapEntry: SourcemapEntry
) {
  const tsVueFileName = toTSVueFIleName(fileName)

  // Parse blocks
  const { template, script } = parseComponent(content, { sourceMap: true, filename: fileName }).descriptor

  // `template` can be empty, yet you always require `script` block
  if (!script) {
    throw new Error('<script/> block is missing in ' + fileName)
  }

  /**
   * Register sourcemap for blocks
   */

  // `template`
  const vueTemplateFileName = toVueTemplateFileName(fileName)
  sourcemapEntry.set(vueTemplateFileName, { map: template ? template.map : undefined })

  const compiledVueTemplateFileName = toCompiledVueTemplateFileName(vueTemplateFileName)
  const compiled = compile(template ? template.content : '', { mode: 'module', sourceMap: true, filename: vueTemplateFileName })
  sourcemapEntry.set(compiledVueTemplateFileName, { map: compiled.map })


  // `script`
  const vueScriptFileName = toVueScriptFileName(fileName)
  sourcemapEntry.set(vueScriptFileName, {
    map: {
      ...script.map!,
      file: vueScriptFileName
    }
  })

  let templateContent = !!compiled.code ? compiled.code : undefined
  let scriptContent = script.content


  /**
   * Create outputs
   */
  const preparationBlock = createPreparationBlock()

  const scriptBlock = transformScript(vueScriptFileName, scriptContent, _ts)
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

  const output = preparationBlock + '\n' + scriptBlock.transformed + '\n' + templateBlock.transformed
  fs.writeFileSync(toTSVueFIleName(fileName), output)

  return output
}

function createPreparationBlock() {
  return 'import { ClassInstance, __createVNodeFromExternalComponent, _VNodeProps, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data } from "__GLOBAL_TYPES";'
}
