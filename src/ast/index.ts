import _ts from 'typescript'

// Find very first node that matches the given syntax kind
export function findTargetSyntaxKind<SK extends _ts.SyntaxKind>(ts: typeof _ts, node: _ts.Node, syntaxKind: SK) {
  type TargetNode = SK extends _ts.SyntaxKind.ExportAssignment ? _ts.ExportAssignment : SK extends _ts.SyntaxKind.ObjectLiteralExpression ? _ts.ObjectLiteralExpression : SK extends _ts.SyntaxKind.CallExpression ? _ts.CallExpression : _ts.Node

  function find(node: _ts.Node): TargetNode | undefined {
    if (node.kind === syntaxKind) {
      return node as any
    }

    return ts.forEachChild(node, find)
  }

  return find(node) as undefined | TargetNode
}
