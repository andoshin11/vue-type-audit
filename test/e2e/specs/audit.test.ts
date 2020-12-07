import * as path from 'path'
import ts from 'typescript'
import { createServiceForTest } from '../service'
import { translateTSVuefileDiagnostic } from '../../../src/helpers/diagnostics'
import { isTSVueFile } from '../../../src/helpers'

function diagnosticSummary(diagnostic: ts.Diagnostic) {
  const { category, code, file, start, length, messageText } = diagnostic

  return {
    category,
    file: file ? file.fileName : null,
    code,
    start,
    length,
    messageText: ts.flattenDiagnosticMessageText(messageText, '\n')
  }
}

describe('audit', () => {
  test('should match snapshot', async () => {
    const localTS = require('../../../node_modules/typescript')
    const configPath = path.resolve(__dirname, '../project/tsconfig.json')
    const service = createServiceForTest(configPath)
    const diagnostics = service.getNativeSemanticDiagnostics()
    expect(diagnostics.map(diagnosticSummary)).toMatchSnapshot()
    const translated = diagnostics.map(d => translateTSVuefileDiagnostic(d, service.sourcemapEntry, service.tsService.getProgram()!.getTypeChecker(), localTS))
    expect(translated.map(diagnosticSummary)).toMatchSnapshot()
  })
})
