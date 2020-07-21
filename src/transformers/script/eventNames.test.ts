import ts from 'typescript'
import { parseEventNamesFromScrtipContent } from './eventNames'

describe('transformers/script/parseEventNamesFromScrtipContent', () => {
  test('parseEventNamesFromScrtipContent', () => {
    const cases: Array<{ content: string; expected: string[] }> = [
      {
        content: `
import { defineComponent } from 'vue'

export default defineComponent({
  emits: {
    input: (val: number) => !!val,
    change: null
  }
})
        `,
        expected: ['input', 'change']
      },

      {
        content: `
import { defineComponent } from 'vue'

export default defineComponent({
})
        `,
        expected: []
      },

      {
        content: `
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['input', 'change']
})
        `,
        expected: ['input', 'change']
      }
    ]

    cases.forEach(c => {
      expect(parseEventNamesFromScrtipContent(c.content, ts)).toEqual(c.expected)
    })
  })
})
