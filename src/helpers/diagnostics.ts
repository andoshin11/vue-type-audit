import _ts from 'typescript'
import { DiagnosticWithRange } from '../types'

export const hasDiagRange = (diagnostic: _ts.Diagnostic): diagnostic is DiagnosticWithRange => {
  const { start, length } = diagnostic
  return typeof start === 'number' && typeof length === 'number'
}
