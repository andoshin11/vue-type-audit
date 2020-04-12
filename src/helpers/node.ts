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

export const location2pos = (content: string, location: Location) => {
  let il = 0, ic = 0;
  for (let i = 0; i < content.length; i++) {
    const cc = content[i];
    if (il === location.line) {
      if (ic === location.column) {
        return i;
      }
    }
    if (cc === '\n') {
      ic = 0;
      il++;
    } else {
      ic++;
    }
  }
  return content.length;
}

// FIXME: use local tsconfig.json target
export const createSourceFile = (ts: typeof _ts, sourceText: string, fileName?: string, languageVersion: _ts.ScriptTarget = ts.ScriptTarget.ES2020) => {
  return ts.createSourceFile(fileName || 'dummy.ts', sourceText, languageVersion)
}

export const getFullTextFromSnapshot = (snapshot: _ts.IScriptSnapshot) => snapshot.getText(0, snapshot.getLength())
