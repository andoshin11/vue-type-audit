import _ts from 'typescript'
import { isTSVueFile, toRawVueFileName, isRawVueFile, toTSVueFIleName } from './path'
import { pos2location, createSourceFile, location2pos, getFullTextFromSnapshot } from './node'
import { SourcemapEntry, DiagnosticWithRange, FileEntry } from '../types'
import { readSystemFile } from './file'
import { findNode } from '../ast'
import { getOriginalPositionFor } from '../sourcemap'
import { Logger } from '../logger'

// TS diagnostic code
const REQUIRE_PROPS_CODE = 2554

const EXTERNAL_COMPONENT_IDENTIFIER_REGEXP = /^_component_.*$/

export const hasDiagRange = (diagnostic: _ts.Diagnostic): diagnostic is DiagnosticWithRange => {
  const { start, length, file } = diagnostic
  return typeof start === 'number' && typeof length === 'number' && !!file
}

export const translateTSVuefileDiagnostic = (diagnostic: _ts.Diagnostic, sourcemapEntry: SourcemapEntry, typeChecker: _ts.TypeChecker, ts: typeof _ts, logger?: Logger, fileEntry?: Map<string, { scriptSnapshot: _ts.IScriptSnapshot }>): _ts.Diagnostic => {
  const { file } = diagnostic

  if (!file || (!isTSVueFile(file.fileName) && !isRawVueFile(file.fileName))) {
    throw new Error('Invalid diagnostic format')
  }

  // Do nothing if the diagnostic has no range
  if (!hasDiagRange(diagnostic)) {
    return diagnostic
  }

  // Update sourcefile
  const tsVueFileName = isTSVueFile(file.fileName) ? file.fileName : toTSVueFIleName(file.fileName)
  const rawVueFileName = isRawVueFile(file.fileName) ? file.fileName : toRawVueFileName(file.fileName)
  let originalContent: string | undefined
  if (fileEntry) {
    const file = fileEntry.get(rawVueFileName)
    if (file) {
      originalContent = getFullTextFromSnapshot(file.scriptSnapshot)
    } else {
      originalContent = readSystemFile(rawVueFileName)
    }
  } else {
    originalContent = readSystemFile(rawVueFileName)
  }
  if (!originalContent) {
    throw new Error(`could not find file: ${rawVueFileName}`)
  }
  const sourcefile = createSourceFile(ts, originalContent, rawVueFileName)

  // Recover original position
  const { start, length } = diagnostic
  const content = file.getFullText()
  const startLC = pos2location(content, start)
  const endLC = pos2location(content, start + length)

  const originalStartLC = getOriginalPositionFor(tsVueFileName, startLC, sourcemapEntry)
  const originalEndLC = getOriginalPositionFor(tsVueFileName, endLC, sourcemapEntry)

  const originalStartPos = location2pos(originalContent, originalStartLC)
  const originalEndPos = location2pos(originalContent, originalEndLC)

  // Translate Message
  const translatedMessage = translateDiagnosticMessage(diagnostic, typeChecker, ts, logger)
  // console.log(ts.flattenDiagnosticMessageText(translatedMessage, '\n'))

  return {
    ...diagnostic,
    file: sourcefile,
    start: originalStartPos,
    length: originalEndPos - originalStartPos,
    messageText: translatedMessage
  }
}

export const translateDiagnosticMessage = (diagnostic: DiagnosticWithRange, typeChecker: _ts.TypeChecker, ts: typeof _ts, logger?: Logger): string | _ts.DiagnosticMessageChain => {
  const { code, start, messageText, file } = diagnostic
  if (logger) {
    logger.info(code)
    logger.info(messageText)
  }
  const translationTargetCodes = [REQUIRE_PROPS_CODE]
  let translatedMessage = messageText

  if (!translationTargetCodes.includes(code)) return translatedMessage

  if (diagnostic.code === REQUIRE_PROPS_CODE) {
    const node = findNode(file, start)
    if (!node) return translatedMessage
    const _createVNode = node.parent
    if (!ts.isCallExpression(_createVNode)) return translatedMessage
    const firstArg = _createVNode.arguments[0]
    if (!firstArg) return translatedMessage

    /**
     * Check if it's an external component node
     */

     // Check Node Type
    const typeInfo = typeChecker.getTypeAtLocation(firstArg)
    const isLiteralType = typeInfo.flags === ts.TypeFlags.StringLiteral
    if (!isLiteralType) return translatedMessage

    // Check external component Name
    const isExternalComponentNode = ts.isIdentifier(firstArg) && EXTERNAL_COMPONENT_IDENTIFIER_REGEXP.test(firstArg.escapedText.toString())
    if (!isExternalComponentNode) return translatedMessage

    const tagName = (typeInfo as _ts.LiteralType).value.toString()
    translatedMessage = `Missing required props for <${tagName}/> component.`

    // Check external component props type
    const requiredPropsNames = findRequiredPropNames(file, tagName, typeChecker, ts, logger)
    if (requiredPropsNames != null && requiredPropsNames.length >= 1) {
      translatedMessage = `Missing props [${requiredPropsNames.join(',')}] for <${tagName}/> component.`
    }

    return translatedMessage

  }

  return translatedMessage
}

export function findRequiredPropNames(file: _ts.SourceFile, componentName: string, typeChecker: _ts.TypeChecker, ts: typeof _ts, logger?: Logger): null | string[] {
  const findPropsDict = (node: _ts.Node): _ts.Node | undefined => {
    if (ts.isTypeAliasDeclaration(node) && node.name.escapedText.toString() === '___ExternalComponentsProps') {
      return node
    }
    return ts.forEachChild(node, findPropsDict)
  }
  const propsDict = findPropsDict(file)!

  const findTargetProperty = (node: _ts.Node): _ts.Node | undefined => {
    if (ts.isPropertySignature(node) && (node.name as _ts.Identifier).escapedText.toString() === componentName) {
      return node
    }
    return ts.forEachChild(node, findTargetProperty)
  }
  const targetComponent = findTargetProperty(propsDict)!
  const propType = typeChecker.getTypeAtLocation(targetComponent)

  const typeString = typeChecker.typeToString(propType)
  if (typeString === 'never') return null
  const requiredPropNames = typeString.split('|').map(s => s.trim())

  return requiredPropNames
}
