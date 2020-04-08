import _ts from 'typescript'

export * from './diagnostics'

export type Location = { line: number; character: number }

export type FileEntry = Map<string, { version: number; scriptSnapshot: _ts.IScriptSnapshot }>
