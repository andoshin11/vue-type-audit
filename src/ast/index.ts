import _ts from 'typescript'

// Find very first node that matches the given syntax kind
export function findTargetSyntaxKind<SK extends _ts.SyntaxKind>(ts: typeof _ts, node: _ts.Node, syntaxKind: SK) {
  type TargetNode = SK extends _ts.SyntaxKind.ExportAssignment ? _ts.ExportAssignment : SK extends _ts.SyntaxKind.ObjectLiteralExpression ? _ts.ObjectLiteralExpression : SK extends _ts.SyntaxKind.CallExpression ? _ts.CallExpression : SK extends _ts.SyntaxKind.ArrayLiteralExpression ? _ts.ArrayLiteralExpression : _ts.Node

  function find(node: _ts.Node): TargetNode | undefined {
    if (node.kind === syntaxKind) {
      return node as any
    }

    return ts.forEachChild(node, find)
  }

  return find(node) as undefined | TargetNode
}

export function findNode(sourceFile: _ts.SourceFile, position: number, lastChild: boolean = false): _ts.Node | undefined {
  function find(node: _ts.Node): _ts.Node | undefined {
    if (position >= node.getStart() && position < node.getEnd()) {
      return _ts.forEachChild(node, find) || node;
    }
  }
  const target = find(sourceFile)
  if (lastChild) {
    return target && findLastChild(target)
  } else {
    return target
  }
}

// if the node has children, retrive the first child
function findLastChild(node: _ts.Node) {
  function find(n: _ts.Node): _ts.Node {
    return !n.getChildCount() ? n : find(n.getChildren()[0])
  }
  return find(node)
}