import {
  RawVueFileName,
  VueTemplateFileName,
  CompiledVueTemplateFileName,
  TransformedCompiledVueTemplateFileName,
  TSVueFileName,
  VueScriptFileName,
  TransformedVueScriptFileName
} from "../types";

export const toRelativePath = (str: string) =>
  str.replace(process.cwd() + "/", "");

export const toTSVueFIleName = (fileName: RawVueFileName) => `${fileName}.ts` as TSVueFileName

export const toVueTemplateFileName = (fileName: RawVueFileName) =>
  `${fileName}.template.ts` as VueTemplateFileName;

export const toVueScriptFileName = (fileName: RawVueFileName) =>
  `${fileName}.script.ts` as VueScriptFileName;

export const toCompiledVueTemplateFileName = (fileName: VueTemplateFileName) =>
  fileName.replace(/\.ts$/, ".compiled.ts") as CompiledVueTemplateFileName;

export const toTransformedCompiledVueTemplateFileName = (
  fileName: CompiledVueTemplateFileName
) =>
  fileName.replace(
    /\.compiled\.ts$/,
    ".compiled.transformed.ts"
  ) as TransformedCompiledVueTemplateFileName;

export const toTransformedVueScriptFileName = (fileName: VueScriptFileName) => fileName.replace(/\.ts$/, '.transformed.ts') as TransformedVueScriptFileName

export const toRawVueFileName = (fileName: TSVueFileName | CompiledVueTemplateFileName): RawVueFileName => {
  if (isTSVueFile(fileName)) {
    return fileName.replace(/\.ts$/, '') as RawVueFileName
  } else if (isCompiledVueTemplateFile(fileName)) {
    return fileName.replace(/\.template\.compiled\.ts$/, '') as RawVueFileName
  } else {
    throw new Error('could not trnsform to raw vue file name')
  }
}

/**
 * User Type Guards
 */
export const isRawVueFile = (fileName: string): fileName is RawVueFileName =>
  /\.vue$/.test(fileName);

export const isTSVueFile = (fileName: string): fileName is TSVueFileName =>
  /\.vue\.ts$/.test(fileName);

export const isVueScriptFile = (fileName: string): fileName is VueScriptFileName => /\.vue\.script\.ts$/.test(fileName)

export const isVueTemplateFile = (fileName: string): fileName is VueTemplateFileName => /\.vue\.template\.ts$/.test(fileName)

export const isCompiledVueTemplateFile = (fileName: string): fileName is CompiledVueTemplateFileName => /\.vue\.template\.compiled\.ts$/.test(fileName)
