import { transformTemplate } from './transformers'
import { CompiledVueTemplateFileName } from '../../types'

describe('transformers/template/transformers', () => {

  test('transformTemplate', () => {
    const cases = [
      `
import { toDisplayString as _toDisplayString, createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue";

export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("h1", null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
  ]))
}
    `,
    `
import { createVNode as _createVNode, toDisplayString as _toDisplayString, resolveComponent as _resolveComponent, openBlock as _openBlock, createBlock as _createBlock } from "vue"

function render(_ctx: __ComponentType) {
  const _component_HelloWorld = _resolveComponent("HelloWorld")

  return (_openBlock(), _createBlock("div", null, [
    _createVNode("img", { src: "./logo.png" }),
    _createVNode("h1", null, "Hello Vue 3!"),
    _createVNode("button", { onClick: _ctx.inc }, "Clicked " + _toDisplayString(_ctx.count.length) + " times.", 9 /* TEXT, PROPS */, ["onClick"]),
    _createVNode(_component_HelloWorld)
  ]))
}   
    `,
    ]

    cases.forEach(c => {
      const transformed = transformTemplate('test.vue.template.ts' as CompiledVueTemplateFileName, c)
      expect(transformed).toMatchSnapshot()
    })
  })
})
