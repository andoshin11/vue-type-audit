import _ts from 'typescript'
import { createSourceFile } from '../../helpers'
import { findTargetSyntaxKind } from '../../ast'

// Returns name:val pair of external components
export function parseExternalComponentsFromScrtipContent(scriptContent: string, ts: typeof _ts): Record<string, string> {
  const node = findExternalComponents(scriptContent, ts)
  if (!node) return {}
  const externalComponents = node.properties

  const dict = externalComponents.reduce((acc, ac) => {
    if (ts.isShorthandPropertyAssignment(ac)) {
      const componentName = ac.name.escapedText.toString()
      acc[componentName] = componentName
    } else if (ts.isPropertyAssignment(ac)) {
      // TODO
      // const name = ac.name
      // if (isStringLiteral(name)) {

      // }
    }

    return acc
  }, {} as Record<string, string>)

  return dict
}

function findExternalComponents(scriptContent: string, ts: typeof _ts): _ts.ObjectLiteralExpression | undefined {
  const node = createSourceFile(ts, scriptContent)
  const exportAssignment = findTargetSyntaxKind(ts, node, ts.SyntaxKind.ExportAssignment)

  if (!exportAssignment) {
    return undefined
  }

  // TODO: allow to default export variable

  const callExpression = findTargetSyntaxKind(ts, exportAssignment, ts.SyntaxKind.CallExpression)
  if (!callExpression) {
    return undefined
  }

  const objectLiteralExpression = findTargetSyntaxKind(ts, callExpression, ts.SyntaxKind.ObjectLiteralExpression)
  if (!objectLiteralExpression) {
    return undefined
  }

  // Find `components` property
  function findComponentsProperty(node: _ts.Node): _ts.Node | undefined {
    if (ts.isPropertyAssignment(node)) {
      const name = node.name
      if ('escapedText' in name && name.escapedText === 'components') {
        return node
      }
    }
    return ts.forEachChild(node, findComponentsProperty)
  }

  const componentsProperty = findComponentsProperty(objectLiteralExpression)
  if (!componentsProperty) return undefined

  // Get external components
  return findTargetSyntaxKind(ts, componentsProperty, ts.SyntaxKind.ObjectLiteralExpression)
}
