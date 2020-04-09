import _ts from 'typescript'
import { RawSourceMap } from 'source-map'

export * from './diagnostics'
export * from './path'

export type Location = { line: number; column: number }

export type FileEntry = Map<string, { version: number; scriptSnapshot: _ts.IScriptSnapshot }>

export type SourcemapEntry = Map<string, { map?: RawSourceMap }>

export type Brand<V, Brand extends string> = V & { readonly __brand__: Brand }
