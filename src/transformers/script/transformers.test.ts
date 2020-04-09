import ts from 'typescript'
import { transformScript } from './transformers'
import { VueScriptFileName } from '../../types'

describe('transformers/script/transformers', () => {

  test('transformScript', () => {
    const cases = [
      `
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
    `,
    `
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true
    }
  }
})
    `,
    ]

    cases.forEach(c => {
      const transformed = transformScript('test.vue.script.ts' as VueScriptFileName, c, ts)
      expect(transformed).toMatchSnapshot()
    })
  })
})
