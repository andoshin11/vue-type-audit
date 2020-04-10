import _ts from 'typescript'
import { Location } from '../types'

export const pos2location = (content: string, pos: number): Location => {
  let l = 0,
    c = 0;
  for (let i = 0; i < content.length && i < pos; i++) {
    const cc = content[i];
    if (cc === '\n') {
      c = 0;
      l++;
    } else {
      c++;
    }
  }
  return { line: l, column: c };
}

// FIXME: use local tsconfig.json target
export const createSourceFile = (ts: typeof _ts, sourceText: string, languageVersion: _ts.ScriptTarget = ts.ScriptTarget.ES2020, fileName?: string) => {
  return ts.createSourceFile(fileName || 'dummy.ts', sourceText, languageVersion)
}

export const getFullTextFromSnapshot = (snapshot: _ts.IScriptSnapshot) => snapshot.getText(0, snapshot.getLength())
