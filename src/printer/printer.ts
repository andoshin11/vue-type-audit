import _ts from 'typescript'
import * as prettier from 'prettier'

export class Printer {
  printer: _ts.Printer

  constructor(private ts: typeof _ts) {
    this.printer = ts.createPrinter()
  }

  print(nodeList: _ts.Node[]) {
    const { printer, ts } = this
    return printer.printList(
      ts.ListFormat.MultiLine,
      ts.createNodeArray(nodeList),
      ts.createSourceFile('', '', ts.ScriptTarget.ES2015)
    )
  }

  prettyPrint(nodeList: _ts.Node[]) {
    const printed = this.print(nodeList)
    return prettier.format(printed, { parser: 'typescript' })
  }
}
