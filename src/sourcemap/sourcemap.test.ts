import ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { transformVueFile } from '../transformers'
import { RawVueFileName, SourcemapEntry, Location, TSVueFileName } from '../types'
import { getOriginalPositionFor, getGeneratedPositionFor } from '.'

const sampleComponent = fs.readFileSync(path.resolve(__dirname, './fixtures/Sample.vue'), 'utf-8')
const sampleTransformed = fs.readFileSync(path.resolve(__dirname, './fixtures/Sample.vue.ts'), 'utf-8')

describe('sourcemap', () => {

  test('getOriginalPositionFor', () => {
    // Prepare
    const sourcemapEntry: SourcemapEntry = new Map()
    const transformed = transformVueFile('test.vue' as RawVueFileName, sampleComponent, sourcemapEntry, ts)
    expect(transformed).toBe(sampleTransformed)

    const cases: Array<{ location: Location, expected: Location }> = [
      {
        location: { line: 17, column: 29 },
        expected: { line: 31, column: 29 }
      },
      {
        location: { line: 66, column: 31 },
        expected: { line: 5, column: 8 }
      },
      {
        location: { line: 68, column: 18 },
        expected: { line: 7, column: 14 }
      }
    ]

    for (const c of cases) {
      const originalPosition = getOriginalPositionFor('test.vue.ts' as TSVueFileName, c.location, sourcemapEntry)
      expect(originalPosition).toEqual(c.expected)
    }
  })

  test('getGeneratedPositionFor', () => {
    const sourcemapEntry: SourcemapEntry = new Map()
    const transformed = transformVueFile('test.vue' as RawVueFileName, sampleComponent, sourcemapEntry, ts)
    expect(transformed).toBe(sampleTransformed)


    const cases: Array<{ location: Location, expected: Location }> = [
      {
        location: { line: 5, column: 9 },
        expected: { line: 66, column: 24 }
      },
      {
        location: { line: 10, column: 14 },
        expected: { line: 74, column: 39 }
      },
      {
        location: { line: 26, column: 19 },
        expected: { line: 12, column: 19 }
      }
    ]

    for (const c of cases) {
      const generatedPosition = getGeneratedPositionFor('test.vue' as RawVueFileName, c.location, sourcemapEntry)
      expect(generatedPosition).toEqual(c.expected)
    }
  })
})
