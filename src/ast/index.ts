import _ts from 'typescript'

// Find very first node that matches the given syntax kind
export function findTargetSyntaxKind(ts: typeof _ts, node: _ts.Node, syntaxKind: _ts.SyntaxKind) {
  function find(node: _ts.Node): _ts.Node | undefined {
    if (node.kind === syntaxKind) {
      return node
    }

    return ts.forEachChild(node, find)
  }

  return find(node)
}
