export const GLOBAL_TYPES_FILE = {
  name: '__GLOBAL_TYPES.d.ts',
  identifier: '__GLOBAL_TYPES',
  content: `
import { ComponentPublicInstance, VNodeProps, VNode, VNodeTypes, ComponentOptions } from 'vue'

export type ClassInstance<T> = T extends new (...args: any[]) => infer U ? U : never;

export type PropTypes<C> = C extends ComponentPublicInstance<infer P, infer B, infer D, infer C, infer M> ? P : never

export declare function __createVNodeFromExternalComponent<C>(type: unknown, ...args: ({} extends PropTypes<C> ? [(VNodeProps & PropTypes<C>)?, unknown?, number?, (string[] | null)?] : [(VNodeProps & PropTypes<C>), unknown?, number?, (string[] | null)?])): VNode;

declare function _createNode<D, N extends keyof D, C = D[N]>(type: N, ...args: ({} extends PropTypes<C> ? [(VNodeProps & PropTypes<C>)?, unknown?, number?, (string[] | null)?] : [(VNodeProps & PropTypes<C>), unknown?, number?, (string[] | null)?])): VNode;

export type _VNodeProps = VNodeProps
export type _VNode = VNode
export type _VNodeTypes = VNodeTypes
export interface _ClassComponent {
  new (...args: any[]): ComponentPublicInstance<any, any, any, any, any>;
  __vccOpts: ComponentOptions;
}
export type _Data = {
  [key: string]: unknown;
};
`
}
