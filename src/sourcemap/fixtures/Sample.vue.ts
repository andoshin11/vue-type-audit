
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import Counter from './Counter.vue'

const __Component = defineComponent({
  components: {
    HelloWorld,
    Counter
  },
  setup(props) {
    const count = ref(0)
    const handleChange = (val: number) => {
      count.value = val
    }
    const doSomethingToString = (val: string) => val.length
    console.log(count.value.length)
    const doNothing = () => {}
    return {
      count,
      handleChange,
      doSomethingToString,
      doNothing
    }
  }
})


///////////////////// START: Type Helpers ///////////////////
import { ClassInstance, _VNodeProps, _resolveComponent, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data, RequiredProps, WithEmitType, MixIntoComponent, isNeverType } from "^__GLOBAL_TYPES";

type EVENT_DICT = {

}

type __ExternalComponents = {
  HelloWorld: typeof HelloWorld;
  Counter: typeof Counter;
}

type __ExternalComponentsProps = {
  HelloWorld: RequiredProps<__ExternalComponents['HelloWorld']>;
  Counter: RequiredProps<__ExternalComponents['Counter']>;
}

const ___Component: MixIntoComponent<typeof __Component, WithEmitType<typeof __Component, EVENT_DICT>> = __Component as any

export default ___Component;

type __PropArg<N> = N extends keyof __ExternalComponents ?  PropTypes<__ExternalComponents[N]> : _Data
type __EmitArg<N> = N extends keyof __ExternalComponents ? __ExternalComponents[N]['__emitHandlerTypes'] : {}
type __DOMArg<N> = N extends string ? N extends keyof __ExternalComponents ? {} : JSX.IntrinsicElements[N] : {}

declare function _createVNode<N extends (keyof __ExternalComponents | _VNodeTypes | _ClassComponent)>(type: N, ...args: (N extends keyof __ExternalComponents ? true extends isNeverType<__ExternalComponentsProps[N]> ? [(_VNodeProps & __PropArg<N> & __EmitArg<N>)?, unknown?, number?, (string[] | null)?, boolean?] : [(_VNodeProps & __PropArg<N> & __EmitArg<N>), unknown?, number?, (string[] | null)?, boolean?] : [((_Data & _VNodeProps & __DOMArg<N>) | null)?, unknown?, number?, (string[] | null)?, boolean?])): _VNode;
///////////////////// END: Type Helpers /////////////////////

import { createVNode as #createVNode, toDisplayString as _toDisplayString, resolveComponent as #resolveComponent, createCommentVNode as _createCommentVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue"

function render(_ctx: ClassInstance<typeof __Component>) {
  const _component_HelloWorld = _resolveComponent("HelloWorld")
  const _component_Counter = _resolveComponent("Counter")

  return (_openBlock(), _createBlock("div", null, [
    _createVNode("img", { src: "./logo.png" }),
    _createVNode("h1", null, "Hello Vue 3!"),
    _createVNode("a", { href: 2 }, "Link"),
    _createVNode("h2", null, "Clicked " + _toDisplayString(_ctx.count.length) + " times.", 1 /* TEXT */),
    _createVNode(_component_HelloWorld),
    _createVNode(_component_Counter),
    _createVNode(_component_Counter, {
      onChange: _ctx.handleChange,
      onInput: _ctx.doNothing
    }, null, 8 /* PROPS */, ["onChange", "onInput"]),
    _createVNode(_component_Counter, { onChange: _ctx.doSomethingToString }, null, 8 /* PROPS */, ["onChange"]),
    _createCommentVNode(" should throw handler type error "),
    _createVNode(_component_Counter, { onChanged: _ctx.handleChange }, null, 8 /* PROPS */, ["onChanged"]),
    _createCommentVNode(" should throw handler name error ")
  ]))
}