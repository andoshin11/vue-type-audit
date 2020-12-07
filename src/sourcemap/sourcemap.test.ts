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
        location: { line: 16, column: 29 },
        expected: { line: 30, column: 29 }
      },
      {
        location: { line: 65, column: 31 },
        expected: { line: 4, column: 15 }
      },
      {
        location: { line: 66, column: 71 },
        expected: { line: 5, column: 25 }
      },
      {
        location: { line: 67, column: 18 },
        expected: { line: 6, column: 17 }
      },
      {
        location: { line: 70, column: 37 },
        expected: { line: 8, column: 34 }
      },
      {
        location: { line: 73, column: 40 },
        expected: { line: 9, column: 14 }
      },
      {
        location: { line: 75, column: 40 },
        expected: { line: 10, column: 14 }
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
        location: { line: 30, column: 29 },
        expected: { line: 16, column: 29 }
      },
      {
        location: { line: 4, column: 9 },
        expected: { line: 65, column: 24 }
      },
      {
        location: { line: 9, column: 14 },
        expected: { line: 73, column: 39 }
      },
      {
        location: { line: 6, column: 6 },
        expected: { line: 67, column: 4 }
      },
      {
        location: { line: 6, column: 16 },
        expected: { line: 67, column: 4 }
      }
    ]

    for (const c of cases) {
      const generatedPosition = getGeneratedPositionFor('test.vue' as RawVueFileName, c.location, sourcemapEntry)
      expect(generatedPosition).toEqual(c.expected)
    }
  })
})
