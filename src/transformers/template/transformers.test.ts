import ts from 'typescript'
import { createSourceFile } from '../../helpers'
import { Printer } from '../../printer'
import { transformRenderCall } from './transformers'

describe('transformers/template/transformers', () => {
  const printer = new Printer(ts)


  test('transformTemplate', () => {
    const rawText = `
import { toDisplayString as _toDisplayString, createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue";

export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("h1", null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
  ]))
}
    `
    const sourceFile = createSourceFile(ts, rawText, ts.ScriptTarget.ES2017)
    const output = transformRenderCall(sourceFile, ts)

    expect(printer.print(output)).toMatchSnapshot()
  })

  test('transformRenderCall', () => {
    const rawText = `
import { toDisplayString as _toDisplayString, createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue";

export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("h1", null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
  ]))
}
    `
    const sourceFile = createSourceFile(ts, rawText, ts.ScriptTarget.ES2017)
    const output = transformRenderCall(sourceFile, ts)

    expect(printer.print(output)).toMatchSnapshot()
  })
})