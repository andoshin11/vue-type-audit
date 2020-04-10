import { parse as parseComponent } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import { RawVueFileName, SourcemapEntry } from '../types'
import { toVueScriptFileName, toVueTemplateFileName, toCompiledVueTemplateFileName } from '../helpers'

export function parseBlocks(
  fileName: RawVueFileName,
  content: string,
  sourcemapEntry: SourcemapEntry
) {
  let { template, script } = parseComponent(content, { sourceMap: true, filename: fileName }).descriptor

  // `template` can be empty, yet you always require `script` block
  if (!script) {
    content += `
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
})
</script>
    `
    const appended = parseComponent(content, { sourceMap: true, filename: fileName }).descriptor
    template = appended.template
    script = appended.script!
  }

  /**
   * Register sourcemap for blocks
   */

  // `template`
  const vueTemplateFileName = toVueTemplateFileName(fileName)
  // FIXME
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

  return {
    templateContent,
    scriptContent
  }
}
