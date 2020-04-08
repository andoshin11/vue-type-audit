import _ts from 'typescript'
import { findTargetSyntaxKind } from '../../ast'

// Compiled template code should have 1 import statement, and 1 function declaration
export function transformRenderCall(template: _ts.SourceFile, ts: typeof _ts): _ts.Node[] {
  const importStatement = findTargetSyntaxKind(ts, template, ts.SyntaxKind.ImportDeclaration)!
  const blockDeclaration = findTargetSyntaxKind(ts, template, ts.SyntaxKind.Block)! as _ts.Block

  const transformed = [
    importStatement,

    ts.createFunctionDeclaration(
      undefined,
      undefined,
      undefined,
      ts.createIdentifier("render"),
      undefined,
      [ts.createParameter(
        undefined,
        undefined,
        undefined,
        ts.createIdentifier("_ctx"),
        undefined,
        ts.createTypeReferenceNode(
          ts.createIdentifier("__ComponentType"),
          undefined
        ),
        undefined
      )],
      undefined,
      blockDeclaration
    )
  ]

  return transformed
}
