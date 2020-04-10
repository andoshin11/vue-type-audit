import {
  isRawVueFile,
  toTSVueFIleName,
  isTSVueFile,
  isVueScriptFile,
  isVueTemplateFile,
  isCompiledVueTemplateFile
} from './path'

describe('helpers/path', () => {
  test('isRawVueFile', () => {
    const cases: Array<{ name: string; expected: boolean }> = [
      {
        name: 'test.vue',
        expected: true
      },
      {
        name: 'test.ts',
        expected: false
      },
      {
        name: 'test.vue.ts',
        expected: false
      },
      {
        name: 'test.vue.template.ts',
        expected: false
      },
      {
        name: 'test.vue.script.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.transformed.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.transformed.ts',
        expected: false
      }
    ]

    cases.forEach(c => {
      expect(isRawVueFile(c.name)).toBe(c.expected)
    })
  })

  test('isTSVueFile', () => {
    const cases: Array<{ name: string; expected: boolean }> = [
      {
        name: 'test.vue',
        expected: false
      },
      {
        name: 'test.ts',
        expected: false
      },
      {
        name: 'test.vue.ts',
        expected: true
      },
      {
        name: 'test.vue.template.ts',
        expected: false
      },
      {
        name: 'test.vue.script.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.transformed.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.transformed.ts',
        expected: false
      }
    ]

    cases.forEach(c => {
      expect(isTSVueFile(c.name)).toBe(c.expected)
    })
  })

  test('isVueScriptFile', () => {
    const cases: Array<{ name: string; expected: boolean }> = [
      {
        name: 'test.vue',
        expected: false
      },
      {
        name: 'test.ts',
        expected: false
      },
      {
        name: 'test.vue.ts',
        expected: false
      },
      {
        name: 'test.vue.template.ts',
        expected: false
      },
      {
        name: 'test.vue.script.ts',
        expected: true
      },
      {
        name: 'test.vue.template.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.transformed.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.transformed.ts',
        expected: false
      }
    ]

    cases.forEach(c => {
      expect(isVueScriptFile(c.name)).toBe(c.expected)
    })
  })

  test('isVueTemplateFile', () => {
    const cases: Array<{ name: string; expected: boolean }> = [
      {
        name: 'test.vue',
        expected: false
      },
      {
        name: 'test.ts',
        expected: false
      },
      {
        name: 'test.vue.ts',
        expected: false
      },
      {
        name: 'test.vue.template.ts',
        expected: true
      },
      {
        name: 'test.vue.script.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.transformed.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.transformed.ts',
        expected: false
      }
    ]

    cases.forEach(c => {
      expect(isVueTemplateFile(c.name)).toBe(c.expected)
    })
  })

  test('isCompiledVueTemplateFile', () => {
    const cases: Array<{ name: string; expected: boolean }> = [
      {
        name: 'test.vue',
        expected: false
      },
      {
        name: 'test.ts',
        expected: false
      },
      {
        name: 'test.vue.ts',
        expected: false
      },
      {
        name: 'test.vue.template.ts',
        expected: false
      },
      {
        name: 'test.vue.script.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.ts',
        expected: true
      },
      {
        name: 'test.vue.script.compiled.ts',
        expected: false
      },
      {
        name: 'test.vue.template.compiled.transformed.ts',
        expected: false
      },
      {
        name: 'test.vue.script.compiled.transformed.ts',
        expected: false
      }
    ]

    cases.forEach(c => {
      expect(isCompiledVueTemplateFile(c.name)).toBe(c.expected)
    })
  })
})