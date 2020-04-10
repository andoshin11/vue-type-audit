import _ts from 'typescript'
import * as fs from 'fs'
import chalk from 'chalk'
import { pos2location, hasDiagRange, toRelativePath, isTSVueFile, toRawVueFileName } from '../helpers'
import { DiagnosticWithRange, SourcemapEntry } from '../types'
import { lineMark, pad, lineMarkForUnderline } from './helper'
import { getOriginalPositionFor } from '../sourcemap'

export class Reporter {
  constructor(private sourcemapEntry: SourcemapEntry) {}

  report(msg: any) {
    console.log(msg)
  }

  reportDiagnosticsSummary(diagnostics: _ts.Diagnostic[]) {
    if (!diagnostics.length) {
      this.report('✨  No type error found')
      return
    }

    let outputs: string[] = []
    const errors = diagnostics.filter(d => d.category === _ts.DiagnosticCategory.Error).length
    const warnings = diagnostics.filter(d => d.category === _ts.DiagnosticCategory.Warning).length

    if (!!errors) outputs.push(`Found ${chalk.red(errors)} errors`)
    if (!!warnings) outputs.push(`Found ${chalk.yellow(warnings)} warnings`)

    const output = outputs.join('\n')
    this.report(output)
  }

  reportDiagnostics(diagnostics: _ts.Diagnostic[]) {
    diagnostics.forEach(d => {
      if (hasDiagRange(d)) {
        this._reportDiagnosticWithRange(d)
      } else {
        this.report(d)
      }
    })
  }

  _reportDiagnosticWithRange(diagnostic: DiagnosticWithRange) {
    const { start, length, file, messageText } = diagnostic
    let content = file && file.getFullText()
    if (!content) return

    const fileName = file!.fileName

    let startLC = pos2location(content, start)
    let endLC = pos2location(content, start + length)

    /**
     * If diagnostic target is .vue file,
     * then recover original position from sourcefile.
     */
    if (isTSVueFile(fileName)) {
      startLC = getOriginalPositionFor(fileName, startLC, this.sourcemapEntry)!
      endLC = getOriginalPositionFor(fileName, endLC, this.sourcemapEntry)!
      content = fs.readFileSync(toRawVueFileName(fileName), 'utf8')
    }

    /**
     * Example:
     * > src/App.vue.ts:24:1 - Property 'length' does not exist on type 'number'.
     */
    const relativeFileName = toRelativePath(file!.fileName)
    const fileIndicator = `${relativeFileName}:${startLC.line + 1}:${startLC.column + 1}`
    const message = typeof messageText === 'string' ? messageText : messageText.messageText
    const outputs = [`${fileIndicator} - ${message}`, '']


    const allLines = content.split('\n');
    const preLines = allLines.slice(Math.max(startLC.line - 1, 0), startLC.line);
    const lines = allLines.slice(startLC.line, endLC.line + 1);
    const postLines = allLines.slice(endLC.line + 1, Math.min(allLines.length - 1, endLC.line + 2));
    const lineMarkerWidth = (Math.min(allLines.length - 1, endLC.line + 2) + '').length;
    for (let i = 0; i < preLines.length; ++i) {
      outputs.push(lineMark(i + startLC.line - 1, lineMarkerWidth) + chalk.reset(preLines[i]));
    }
    for (let i = 0; i < lines.length; ++i) {
      outputs.push(lineMark(i + startLC.line, lineMarkerWidth) + lines[i]);
      if (i === 0) {
        if (startLC.line === endLC.line) {
          outputs.push(
            lineMarkForUnderline(lineMarkerWidth) +
              pad(' ', startLC.column) +
              chalk.red(pad('~', endLC.column - startLC.column)),
          );
        } else {
          outputs.push(
            lineMarkForUnderline(lineMarkerWidth) +
              pad(' ', startLC.column) +
              chalk.red(pad('~', lines[i].length - startLC.column)),
          );
        }
      } else if (i === lines.length - 1) {
        outputs.push(lineMarkForUnderline(lineMarkerWidth) + chalk.red(pad('~', endLC.column)));
      } else {
        outputs.push(lineMarkForUnderline(lineMarkerWidth) + chalk.red(pad('~', lines[i].length)));
      }
    }

    for (let i = 0; i < postLines.length; ++i) {
      outputs.push(lineMark(i + endLC.line + 1, lineMarkerWidth) + chalk.reset(postLines[i]));
    }
    outputs.push('');

    this.report(outputs.join('\n'))
  }
}
