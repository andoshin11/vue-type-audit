import _ts from 'typescript'

export type DiagnosticWithRange = Omit<_ts.Diagnostic, 'start' | 'length'> & { start: NonNullable<_ts.Diagnostic['start']>; length: NonNullable<_ts.Diagnostic['length']> }
