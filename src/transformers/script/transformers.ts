import _ts, { isPropertyAssignment, isShorthandPropertyAssignment } from 'typescript'
import { SourceMapGenerator, RawSourceMap } from 'source-map'
import { DefaultExportObjectRegEx } from './regexp'
import { VueScriptFileName } from '../../types'
import { toTransformedVueScriptFileName, createSourceFile } from '../../helpers'
import { findTargetSyntaxKind } from '../../ast'

export function transformScript(
  fileName: VueScriptFileName,
  content: string,
  ts: typeof _ts
) {
  const transformedVueScriptFileName = toTransformedVueScriptFileName(fileName)
  const gen = new SourceMapGenerator({ file: transformedVueScriptFileName })
  gen.setSourceContent(fileName, content)

  const hasDefaultExportObject = DefaultExportObjectRegEx.test(content)
  if (!hasDefaultExportObject) {
    throw new Error('could not find default exported object from script block')
  }

  const stripDefaultExport = content.replace(DefaultExportObjectRegEx, 'const __Component =')
  const externalComponentsType = createExternalComponentsType(content, ts)
  const footer = `
export default __Component;\ntype __ComponentType = ClassInstance<typeof __Component>;\n

declare function _createVNode<N extends (keyof __ExternalComponents | _VNodeTypes | _ClassComponent), C = N extends keyof __ExternalComponents ?  __ExternalComponents[N] : unknown>(type: N, ...args: (N extends keyof __ExternalComponents ? {} extends PropTypes<C> ? [(_VNodeProps & PropTypes<C>)?, unknown?, number?, (string[] | null)?] : [(_VNodeProps & PropTypes<C>), unknown?, number?, (string[] | null)?] : [((_Data & _VNodeProps) | null)?, unknown?, number?, (string[] | null)?])): _VNode;

declare function _resolveComponent<N extends keyof __ResolveComponentNames>(name: N): __ResolveComponentNames[N]
`
  const transformed = stripDefaultExport + `\n\n` + externalComponentsType + footer

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

function createExternalComponentsType(content: string, ts: typeof _ts) {
  const node = createSourceFile(ts, content)
  const exportAssignment = findTargetSyntaxKind(ts, node, ts.SyntaxKind.ExportAssignment)!
  const objectLiteralExpression = findTargetSyntaxKind(ts, exportAssignment, ts.SyntaxKind.ObjectLiteralExpression)!

  // Find `components` property
  function findComponentsProperty(node: _ts.Node): _ts.Node | undefined {
    if (isPropertyAssignment(node)) {
      const name = node.name
      if ('escapedText' in name && name.escapedText === 'components') {
        return node
      }
    }
    return ts.forEachChild(node, findComponentsProperty)
  }

  const componentsProperty = findComponentsProperty(objectLiteralExpression)
  if (!componentsProperty) return ''

  // Get external components name
  const objectLiteralExpression2 = findTargetSyntaxKind(ts, componentsProperty, ts.SyntaxKind.ObjectLiteralExpression)!
  const externalComponents = objectLiteralExpression2.properties

  const dict = externalComponents.reduce((acc, ac) => {
    if (isShorthandPropertyAssignment(ac)) {
      const componentName = ac.name.escapedText.toString()
      acc[componentName] = componentName
    } else if (isPropertyAssignment(ac)) {
      // TODO
      // const name = ac.name
      // if (isStringLiteral(name)) {

      // }
    }

    return acc
  }, {} as Record<string, string>)

  function toVNodeReferenceName(name: string) {
    return `_component_${name}`
  }

  // Set Types
  let output = 'type __ExternalComponents = {\n'
  Object.entries(dict).forEach(([key, val]) => {
    output += `${toVNodeReferenceName(key)}: ClassInstance<typeof ${val}>;\n`
  });
  output += '}\n\n'

  // Set Literal Hint
  output += 'type __ResolveComponentNames = {\n'
  Object.entries(dict).forEach(([key, _]) => {
    output += `${key}: '${toVNodeReferenceName(key)}';\n`
  })
  output += '}\n\n'

  return output
}
