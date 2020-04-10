import * as path from 'path'
import * as fs from 'fs'

export  const readSystemFile = (fileName: string, encoding: string | undefined = 'utf8') => {
  fileName = path.normalize(fileName);
  try {
    return fs.readFileSync(fileName, encoding);
  } catch (e) {
    return undefined;
  }
}
