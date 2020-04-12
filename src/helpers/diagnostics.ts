import _ts from 'typescript'
import { isTSVueFile, toRawVueFileName } from './path'
import { pos2location, createSourceFile, location2pos } from './node'
import { SourcemapEntry, DiagnosticWithRange } from '../types'
import { readSystemFile } from './file'
import { findNode } from '../ast'
import { getOriginalPositionFor } from '../sourcemap'

// TS diagnostic code
const REQUIRE_PROPS_CODE = 2554

const EXTERNAL_COMPONENT_IDENTIFIER_REGEXP = /^_component_.*$/

export const hasDiagRange = (diagnostic: _ts.Diagnostic): diagnostic is DiagnosticWithRange => {
  const { start, length, file } = diagnostic
  return typeof start === 'number' && typeof length === 'number' && !!file
}

export const translateVuefileDiagnostic = (diagnostic: _ts.Diagnostic, sourcemapEntry: SourcemapEntry, typeChecker: _ts.TypeChecker, ts: typeof _ts): _ts.Diagnostic => {
  const { file } = diagnostic

  if (!file || !isTSVueFile(file.fileName)) {
    throw new Error('Invalid diagnostic format')
  }

  // Do nothing if the diagnostic has no range
  if (!hasDiagRange(diagnostic)) {
    return diagnostic
  }

  // Update sourcefile
  const rawVueFileName = toRawVueFileName(file.fileName)
  const originalContent = readSystemFile(rawVueFileName)
  if (!originalContent) {
    throw new Error(`could not find file: ${rawVueFileName}`)
  }
  const sourcefile = createSourceFile(ts, originalContent, rawVueFileName)

  // Recover original position
  const { start, length } = diagnostic
  const content = file.getFullText()
  const startLC = pos2location(content, start)
  const endLC = pos2location(content, start + length)

  const originalStartLC = getOriginalPositionFor(file.fileName, startLC, sourcemapEntry)
  const originalEndLC = getOriginalPositionFor(file.fileName, endLC, sourcemapEntry)

  const originalStartPos = location2pos(originalContent, originalStartLC)
  const originalEndPos = location2pos(originalContent, originalEndLC)

  // Translate Message
  const translatedMessage = translateDiagnosticMessage(diagnostic, typeChecker, ts)

  return {
    ...diagnostic,
    file: sourcefile,
    start: originalStartPos,
    length: originalEndPos - originalStartPos,
    messageText: translatedMessage
  }
}

const translateDiagnosticMessage = (diagnostic: DiagnosticWithRange, typeChecker: _ts.TypeChecker, ts: typeof _ts): string | _ts.DiagnosticMessageChain => {
  const { code, start, messageText, file } = diagnostic
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
    translatedMessage = `Missing props for <${tagName}/> component.`

    // Check external component props type
    const requiredPropsNaemes = findRequiredPropNames(file, tagName, typeChecker, ts)
    if (requiredPropsNaemes.length >= 1) {
      translatedMessage = `Missing props [${requiredPropsNaemes.join(',')}] for <${tagName}/> component.`
    }

    return translatedMessage

  }

  return translatedMessage
}

export function findRequiredPropNames(file: _ts.SourceFile, componentName: string, typeChecker: _ts.TypeChecker, ts: typeof _ts) {
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

  const requiredPropNames = typeChecker.typeToString(propType).split('|').map(s => s.trim())

  return requiredPropNames
}
