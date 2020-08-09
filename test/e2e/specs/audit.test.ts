import * as path from 'path'
import ts from 'typescript'
import { createServiceForTest } from '../service'

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
    const configPath = path.resolve(__dirname, '../project/tsconfig.json')
    const service = createServiceForTest(configPath)
    const diagnostics = service.getSemanticDiagnostics()
    expect(diagnostics.map(diagnosticSummary)).toMatchSnapshot()
  })
})
