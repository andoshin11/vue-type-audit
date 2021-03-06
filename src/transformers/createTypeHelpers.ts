function camelize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function createTypeHelpers(externalComponents: Record<string, string>, eventNames: string[]) {
  return `
///////////////////// START: Type Helpers ///////////////////
import { ClassInstance, _VNodeProps, _resolveComponent, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data, RequiredProps, WithEmitType, MixIntoComponent, isNeverType } from "^__GLOBAL_TYPES";

type EVENT_DICT = {
${eventNames.map(n => `  on${camelize(n)}: "${n}";`).join('\n')}
}

type __ExternalComponents = {
${Object.entries(externalComponents).map(([key, val]) => `  ${key}: typeof ${val};`).join('\n')}
}

type __ExternalComponentsProps = {
${Object.entries(externalComponents).map(([key, val]) => `  ${key}: RequiredProps<__ExternalComponents['${val}']>;`).join('\n')}
}

const ___Component: MixIntoComponent<typeof __Component, WithEmitType<typeof __Component, EVENT_DICT>> = __Component as any

export default ___Component;

type __PropArg<N> = N extends keyof __ExternalComponents ?  PropTypes<__ExternalComponents[N]> : _Data
type __EmitArg<N> = N extends keyof __ExternalComponents ? __ExternalComponents[N]['__emitHandlerTypes'] : {}
type __DOMArg<N> = N extends string ? N extends keyof __ExternalComponents ? {} : JSX.IntrinsicElements[N] : {}

declare function _createVNode<N extends (keyof __ExternalComponents | _VNodeTypes | _ClassComponent)>(type: N, ...args: (N extends keyof __ExternalComponents ? true extends isNeverType<__ExternalComponentsProps[N]> ? [(_VNodeProps & __PropArg<N> & __EmitArg<N>)?, unknown?, number?, (string[] | null)?, boolean?] : [(_VNodeProps & __PropArg<N> & __EmitArg<N>), unknown?, number?, (string[] | null)?, boolean?] : [((_Data & _VNodeProps & __DOMArg<N>) | null)?, unknown?, number?, (string[] | null)?, boolean?])): _VNode;
///////////////////// END: Type Helpers /////////////////////
`
}
