import _ts from 'typescript'
import { createSourceFile } from '../../helpers'
import { findTargetSyntaxKind } from '../../ast'

// Returns an array of emit target event names name:val pair of external components
export function parseEventNamesFromScrtipContent(scriptContent: string, ts: typeof _ts): string[] {
  const node = findEmits(scriptContent, ts)
  if (!node) return []

  if (ts.isObjectLiteralExpression(node)) {
    const emits = node.properties.map(p => {
      if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
        const eventName = p.name.escapedText.toString()
        return eventName
      }
      return ''
    }).filter(Boolean)

    return emits
  } else if (ts.isArrayLiteralExpression(node)) {
    const emits = node.elements.map(e => {
      if (ts.isStringLiteral(e)) {
        const eventName = e.text
        return eventName
      } else {
        return ''
      }
    }).filter(Boolean)

    return emits
  } else {
    return []
  }

}

function findEmits(scriptContent: string, ts: typeof _ts): _ts.ObjectLiteralExpression | _ts.ArrayLiteralExpression | undefined {
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

  // Find `emits` property
  function findEmitsProperty(node: _ts.Node): _ts.Node | undefined {
    if (ts.isPropertyAssignment(node)) {
      const name = node.name
      if ('escapedText' in name && name.escapedText === 'emits') {
        return node
      }
    }
    return ts.forEachChild(node, findEmitsProperty)
  }

  const emitsProperty = findEmitsProperty(objectLiteralExpression)
  if (!emitsProperty) return undefined

  // Get external components
  return findTargetSyntaxKind(ts, emitsProperty, ts.SyntaxKind.ObjectLiteralExpression)
    || findTargetSyntaxKind(ts, emitsProperty, ts.SyntaxKind.ArrayLiteralExpression)
}
