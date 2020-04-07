import _ts from 'typescript'

export type FileEntry = Map<string, { version: number; scriptSnapshot: _ts.IScriptSnapshot }>
