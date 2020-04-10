export function createTypeHelpers(externalComponents: Record<string, string>) {
  return `
///////////////////// START: Type Helpers ///////////////////
import { ClassInstance, _VNodeProps, PropTypes, _VNode, _VNodeTypes, _ClassComponent, _Data } from "__GLOBAL_TYPES";

type __ExternalComponents = {
  ${Object.entries(externalComponents).map(([key, val]) => `${key}: ClassInstance<typeof ${val}>;`).join('\n')}
}

export default __Component;
type __ComponentType = ClassInstance<typeof __Component>;

declare function _createVNode<N extends (keyof __ExternalComponents | _VNodeTypes | _ClassComponent), C = N extends keyof __ExternalComponents ?  __ExternalComponents[N] : unknown>(type: N, ...args: (N extends keyof __ExternalComponents ? {} extends PropTypes<C> ? [(_VNodeProps & PropTypes<C>)?, unknown?, number?, (string[] | null)?] : [(_VNodeProps & PropTypes<C>), unknown?, number?, (string[] | null)?] : [((_Data & _VNodeProps) | null)?, unknown?, number?, (string[] | null)?])): _VNode;

declare function _resolveComponent<N>(name: N): N;
///////////////////// END: Type Helpers /////////////////////
`
}
