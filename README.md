# vue-type-audit ![npm](https://img.shields.io/npm/v/vue-type-audit) ![GitHub](https://img.shields.io/github/license/andoshin11/vue-type-audit) ![CI Status](https://github.com/andoshin11/vue-type-audit/workflows/main/badge.svg)

A TypeScript error checker that supports Vue SFC(Single File Component).
The world's only tool that runs type checking for both child components' prop types and event handler types on Vue template.

<img width="969" alt="Audit Result" src="https://user-images.githubusercontent.com/8381075/88058538-8f706300-cb9e-11ea-831c-0aa24764c0fa.png">

<br/>

<details open>
<summary>App.vue</summary>

```vue
<template>
  <div>
    <img src="./logo.png">
    <h1>Hello Vue 3!</h1>
    <a :href="2">Link</a>
    <h2>Clicked {{ count.length }} times.</h2>
    <HelloWorld/> <!-- `HelloWorld` component requires a string prop!! -->
    <Counter/>
    <Counter @change="handleChange" @input="doNothing"/>
    <Counter @change="doSomethingToString"/> <!-- should throw handler type error -->
    <Counter @changed="handleChange"/> <!-- should throw handler name error -->
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import Counter from './Counter.vue'

export default defineComponent({
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
    const doNothing = () => void
    return {
      count,
      handleChange,
      doSomethingToString,
      doNothing
    }
  }
})
</script>
```

</details>

<details>
<summary>Counter.vue</summary>

```vue
<template>
  <div>
    <h2>Click Count: {{ state.count }}</h2>
    <button @click="increment">Click me</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  emits: {
    change: (val: number) => val < 10,
    input: null
  },
  props: {
    initialValue: {
      type: Number,
      default: 0
    }
  },
  setup({ initialValue }, { emit }) {
    const state = reactive({
      count: initialValue
    });

    const increment = () => {
      state.count++;
      emit("change", state.count);
    };

    return {
      state,
      increment
    };
  }
});
</script>
```

</details>

<details>
<summary>HelloWorld.vue</summary>

```vue
<template>
  <div>
    <label v-if="label">{{ label.length }}</label>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: 'Default Label'
    }
  }
})
</script>
```

</details>

## Current Limitation

- only tested with [vue@3.0.0-rc.1](https://www.npmjs.com/package/vue/v/3.0.0-rc.1).
- only tested with standard Vue SFC. (Class-Style component is not tested!)

## Example Usage

See [example](./example)

## Install

```sh
$ yarn add vue-type-audit
```

## How to use

```sh
$ cd <your project root>
$ node_modules/.bin/type-audit run
```

## CLI Options

```sh
Options:
  -V, --version              output the version number
  -h, --help                 output usage information
```

## Architecture

This tool uses [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to run diagnostics.

When some `.ts/.tsx` module tries to import `.vue` files, this tool intercepts module resolving process of the compiler and returns transformed `.vue` files. (internally the file is interpreted in `<your component name>.vue.ts` format)

```
          import a.vue                     reads actual file
                          ┌-------------┐
`A.ts` -----------------> | TS Compiler | <----------------->  `a.vue`
       <----------------- └-------------┘
                                    ↑
       returns a.vue.ts             |  transforms a.vue   ┌-------------┐
      (transformed version)         └-------------------->| Transformer |
                                        returns a.vue.ts  └-------------┘
```

Transforming process itself is very complicated.
The entire process can be broke down into 4 steps.

1. Parse blocks from SFC.
2. Tranform the template into a render function
3. Modify codes to help type-checking process easier
3. Merge into one `.vue.ts` file

```
                            `a.vue.script.compiled.ts` ----------┐
                                        ↑                        |
          extra transformation          |                        |
                                        |                        |
                            ┌--> `a.vue.script.ts`               |
        parsed into blocks  |                                    |
                            |                                    | merged
`a.vue` --------------------|                                    |
                            |                                    ↓
                            └--> `a.vue.template.ts`        `a.vue.ts`
                                        |                        ↑
     compiled to a render function      |                        |
                                        ↓                        |
                            `a.vue.template.compiled.ts`         | merged
                                        |                        |
        extra transformation            |                        |
                                        ↓                        | 
                      `a.vue.template.compiled.transformed.ts` - ┘

```

Each transformation process emits sourcemap object, so that the error reporter can locate the original position of the code.

### Transformation Examples
Here's a few examples of how the Vue SFCs are interpreted inside the TypeScript compiler.

<details>
<summary>Basic Component</summary>

A basic component that receives props and emits some events.

```vue
<template>
  <div>
    <h2>Click Count: {{ state.count }}</h2>
    <button @click="increment">Click me</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  emits: {
    change: (val: number) => val < 10,
    input: null
  },
  props: {
    initialValue: {
      type: Number,
      default: 0
    }
  },
  setup({ initialValue }, { emit }) {
    const state = reactive({
      count: initialValue
    });

    const increment = () => {
      state.count++;
      emit("change", state.count);
    };

    return {
      state,
      increment
    };
  }
});
</script>
```

will be interpreted as such...

```ts
import { defineComponent, reactive } from "vue";

const __Component = defineComponent({
  emits: {
    change: (val: number) => val < 10,
    input: null
  },
  props: {
    initialValue: {
      type: Number,
      default: 0
    }
  },
  setup({ initialValue }, { emit }) {
    const state = reactive({
      count: initialValue
    });

    const increment = () => {
      state.count++;
      emit("change", state.count);
    };

    return {
      state,
      increment
    };
  }
});


///////////////////// START: Type Helpers ///////////////////
import { ClassInstance, _VNodeProps, _VNode, _VNodeTypes, _ClassComponent, _Data, WithEmitType, MixIntoComponent } from "__GLOBAL_TYPES";

type EVENT_DICT = {
  onChange: "change";
  onInput: "input";
}

const ___Component: MixIntoComponent<typeof __Component, WithEmitType<typeof __Component, EVENT_DICT>> = __Component as any

export default ___Component;

type __DOMArg<N> = N extends string ? JSX.IntrinsicElements[N] : {}

declare function _createVNode<N extends (_VNodeTypes | _ClassComponent)>(type: N, props?: (_Data & _VNodeProps & __DOMArg<N>) | null, children?: unknown, patchFlag?: number, dynamicProps?: string[] | null, isBlockNode?: boolean): _VNode;
///////////////////// END: Type Helpers /////////////////////

import { toDisplayString as _toDisplayString, createVNode as #createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue"

function render(_ctx: ClassInstance<typeof __Component>) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("h2", null, "Click Count: " + _toDisplayString(_ctx.state.count), 1 /* TEXT */),
    _createVNode("button", { onClick: _ctx.increment }, "Click me", 8 /* PROPS */, ["onClick"])
  ]))
}
```

</details>


<details>
<summary>Parent Component</summary>

A component that passes props to child components and receives events from them.

```vue
<template>
  <div>
    <h1>Hello Vue 3!</h1>
    <h2>Clicked {{ count }} times.</h2>
    <HelloWorld msg="Hello Vue"/>
    <Counter @change="handleChange" @input="doNothing"/>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import Counter from './Counter.vue'

export default defineComponent({
  components: {
    HelloWorld,
    Counter
  },
  setup(props) {
    const count = ref(0)
    const handleChange = (val: number) => {
      count.value = val
    }
    const doNothing = () => console.log('do nothing')
    return {
      count,
      handleChange,
      doNothing
    }
  }
})
</script>
```

will be interpreted as such...

```ts
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
    const doNothing = () => console.log('do nothing')
    return {
      count,
      handleChange,
      doNothing
    }
  }
})


///////////////////// START: Type Helpers ///////////////////
import { ClassInstance, _VNodeProps, _resolveComponent, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data, RequiredPropNames, WithEmitType, MixIntoComponent, isNeverType } from "__GLOBAL_TYPES";

type EVENT_DICT = {

}

type __ExternalComponents = {
  HelloWorld: ClassInstance<typeof HelloWorld>;
  Counter: ClassInstance<typeof Counter>;
}

type __ExternalComponentsProps = {
  HelloWorld: RequiredPropNames<__ExternalComponents['HelloWorld']>;
  Counter: RequiredPropNames<__ExternalComponents['Counter']>;
}

const ___Component: MixIntoComponent<typeof __Component, WithEmitType<typeof __Component, EVENT_DICT>> = __Component as any

export default ___Component;

type __PropArg<N> = N extends keyof __ExternalComponents ?  PropTypes<__ExternalComponents[N]> : _Data
type __EmitArg<N> = N extends keyof __ExternalComponents ? __ExternalComponents[N]['$options']['__emitHandlerTypes'] : {}
type __DOMArg<N> = N extends string ? N extends keyof __ExternalComponents ? {} : JSX.IntrinsicElements[N] : {}

declare function _createVNode<N extends (keyof __ExternalComponents | _VNodeTypes | _ClassComponent)>(type: N, ...args: (N extends keyof __ExternalComponents ? true extends isNeverType<__ExternalComponentsProps[N]> ? [(_VNodeProps & __PropArg<N> & __EmitArg<N>)?, unknown?, number?, (string[] | null)?, boolean?] : [(_VNodeProps & __PropArg<N> & __EmitArg<N>), unknown?, number?, (string[] | null)?, boolean?] : [((_Data & _VNodeProps & __DOMArg<N>) | null)?, unknown?, number?, (string[] | null)?, boolean?])): _VNode;
///////////////////// END: Type Helpers /////////////////////

import { createVNode as #createVNode, toDisplayString as _toDisplayString, resolveComponent as #resolveComponent, openBlock as _openBlock, createBlock as _createBlock } from "vue"

function render(_ctx: ClassInstance<typeof __Component>) {
  const _component_HelloWorld = _resolveComponent("HelloWorld")
  const _component_Counter = _resolveComponent("Counter")

  return (_openBlock(), _createBlock("div", null, [
    _createVNode("h1", null, "Hello Vue 3!"),
    _createVNode("h2", null, "Clicked " + _toDisplayString(_ctx.count) + " times.", 1 /* TEXT */),
    _createVNode(_component_HelloWorld, { msg: "Hello Vue" }),
    _createVNode(_component_Counter, {
      onChange: _ctx.handleChange,
      onInput: _ctx.doNothing
    }, null, 8 /* PROPS */, ["onChange", "onInput"])
  ]))
}
```

</details>


## License

MIT
