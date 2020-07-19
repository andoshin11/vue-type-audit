export function createTypeHelpers(externalComponents: Record<string, string>) {
  return `
///////////////////// START: Type Helpers ///////////////////
import { ClassInstance, _VNodeProps, _resolveComponent, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data, RequiredPropNames } from "__GLOBAL_TYPES";

type __ExternalComponents = {
  ${Object.entries(externalComponents).map(([key, val]) => `${key}: ClassInstance<typeof ${val}>;`).join('\n')}
}

type __ExternalComponentsProps = {
  ${Object.entries(externalComponents).map(([key, val]) => `${key}: RequiredPropNames<__ExternalComponents['${val}']>;`).join('\n')}
}

export default __Component;
type __ComponentType = ClassInstance<typeof __Component>;

type __PropArg<N> = N extends keyof __ExternalComponents ?  PropTypes<__ExternalComponents[N]> : _Data

declare function _createVNode<N extends (keyof __ExternalComponents | _VNodeTypes | _ClassComponent)>(type: N, ...args: (N extends keyof __ExternalComponents ? [__ExternalComponentsProps[N]] extends [never] ? [(_VNodeProps & __PropArg<N>)?, unknown?, number?, (string[] | null)?, boolean?] : [(_VNodeProps & __PropArg<N>), unknown?, number?, (string[] | null)?, boolean?] : [((_Data & _VNodeProps) | null)?, unknown?, number?, (string[] | null)?, boolean?])): _VNode;
///////////////////// END: Type Helpers /////////////////////
`
}
