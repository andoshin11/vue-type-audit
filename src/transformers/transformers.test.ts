import ts from 'typescript'
import { transformVueFile } from './transformers'
import { RawVueFileName, SourcemapEntry } from '../types'

describe('transformers', () => {

  test('transformScript', () => {
    const cases = [
      `
<template>
  <div>
    <img src="./logo.png">
    <h1>Hello Vue 3!</h1>
    <button @click="inc">Clicked {{ count.length }} times.</button>
    <HelloWorld/>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'

export default defineComponent({
  components: {
    HelloWorld
  },
  setup(props) {
    const count = ref(0)
    const inc = () => {
      count.value++
    }
    console.log(count.value.length)

    return {
      count,
      inc
    }
  }
})
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>    
    `,
    `
<template>
  <div>
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
    }
  }
})
</script>
    `,
    ]

    const sourcemapEntry = new Map() as SourcemapEntry

    cases.forEach(c => {
      const transformed = transformVueFile('test.vue' as RawVueFileName, c, sourcemapEntry, ts)
      expect(transformed).toMatchSnapshot()
    })

    expect(sourcemapEntry).toMatchSnapshot()
  })
})
