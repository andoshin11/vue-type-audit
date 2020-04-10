import ts from 'typescript'
import { parseExternalComponentsFromScrtipContent } from './externalComponents'

describe('transformers/script/externalComponents', () => {
  test('parseExternalComponentsFromScrtipContent', () => {
    const cases: Array<{ content: string, expected: Record<string, string> }> = [
      {
        content: `
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import Table from './Table.vue'

export default defineComponent({
  components: {
    HelloWorld,
    Table
  },
  setup(props) {
  }
})
        `,
        expected: {
          'HelloWorld': 'HelloWorld',
          'Table': 'Table'
        }
      },
      {
        content: `
import { ref, defineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import Table from './Table.vue'

export const component = defineComponent({
  components: {
    HelloWorld,
    Table
  },
  setup(props) {
  }
})
        `,
        expected: {}
      },
      {
        content: `
import { ref, defineComponent } from 'vue'

export default defineComponent({
  components: {},
  setup(props) {
  }
})
        `,
        expected: {}
      },
      {
        content: `
import { ref, defineComponent } from 'vue'

export default defineComponent({
  setup(props) {
  }
})
        `,
        expected: {}
      },
      {
        content: `
import { ref, defineComponent } from 'vue'

export default defineComponent()
        `,
        expected: {}
      }
    ]

    cases.forEach(c => {
      expect(parseExternalComponentsFromScrtipContent(c.content, ts)).toEqual(c.expected)
    })
  })
})
