export const GLOBAL_TYPES_FILE = {
  name: '^__GLOBAL_TYPES.d.ts',
  identifier: '^__GLOBAL_TYPES',
  content: `
import { ComponentPublicInstance, VNodeProps, VNode, VNodeTypes, ComponentOptions } from 'vue'

export type ClassInstance<T> = T extends new (...args: any[]) => infer U ? U : never;

export type isNeverType<T> = [T] extends [never] ? true : false

interface _AllowedComponentProps {
  class?: unknown;
  style?: unknown;
}

interface _ComponentCustomProps {
}

export type PropTypes<C> = C extends ComponentPublicInstance<infer P, infer B, infer D, infer C, infer M, infer E, infer PublicProps, infer Options> ? (P & PublicProps) extends (VNodeProps & _AllowedComponentProps & _ComponentCustomProps & infer R) ? R : {} : never

type EmitTypes<C> = C extends ComponentPublicInstance<infer P, infer B, infer D, infer C, infer M, infer E, infer PublicProps, infer Options> ? E : never

type ElementType<T> = T extends (infer R)[] ? R : never

export type ToHandlerType<F> = F extends (...args: infer A) => boolean ? (...args: A) => void : null extends F ? (...args: any) => void : never;

export type WithEmitType<T, D extends Record<string, (keyof EmitTypes<ClassInstance<T>>) | (ElementType<EmitTypes<ClassInstance<T>>>)>> = {
  __emitHandlerTypes: {
    [K in keyof D]?: false extends isNeverType<ElementType<EmitTypes<ClassInstance<T>>>> ? (...args: any) => any : D[K] extends keyof EmitTypes<ClassInstance<T>> ? ToHandlerType<EmitTypes<ClassInstance<T>>[D[K]]> : never
  }
}

export type MixIntoComponent<C, T> = C extends new (...args: any[]) => infer U ?  new (...args: any[]) => U extends ComponentPublicInstance<infer P, infer B, infer D, infer C, infer M, infer E, infer PublicProps, infer Options> ? ComponentPublicInstance<P, B, D, C, M, E, PublicProps, Options & T> : never : never;

type RequiredProps<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K
}[keyof T]

export type RequiredPropNames<C> = NonNullable<RequiredProps<PropTypes<C>>>

export declare function _resolveComponent<N>(name: N): N;

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
