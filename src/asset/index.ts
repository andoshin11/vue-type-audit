export const GLOBAL_TYPES_FILE = {
  name: '^__GLOBAL_TYPES.d.ts',
  identifier: '^__GLOBAL_TYPES',
  content: `
import { ComponentPublicInstance, VNodeProps, VNode, VNodeTypes, ComponentOptions, DefineComponent, Prop } from 'vue'

export type ClassInstance<T> = T extends new (...args: any[]) => infer U ? U : never;

export type isNeverType<T> = [T] extends [never] ? true : false

type InferPropType<T> = T extends null ? any : T extends {
  type: null | true;
} ? any : T extends ObjectConstructor | {
  type: ObjectConstructor;
} ? Record<string, any> : T extends BooleanConstructor | {
  type: BooleanConstructor;
} ? boolean : T extends Prop<infer V, infer D> ? (unknown extends V ? D : V) : T;


type __ExtractPropTypes<O> = O extends object ? {
  [K in _RequiredProps<O>]: InferPropType<O[K]>;
} & {
  // @ts-ignore
  [K in Exclude<keyof O, _RequiredProps<O>>]?: InferPropType<O[K]>;
} : {
  [K in string]: any;
};

export type PropTypes<C> = C extends DefineComponent<infer PropsOptions, infer RawBindings, infer D, any, infer M, infer Mixin, infer Extends, infer E, infer EE> ? __ExtractPropTypes<PropsOptions> : never

export type EmitTypes<C> = C extends DefineComponent<infer P, infer B, infer D, any, infer M, infer Mixin, infer Extends, infer E, infer EE, infer PublicProps, infer Props, infer Defaults> ? E : never

export type ElementType<T> = T extends (infer R)[] ? R : never

export type ToHandlerType<F> = F extends (...args: infer A) => boolean ? (...args: A) => void : null extends F ? (...args: any) => void : never;

export type WithEmitType<T, D extends Record<string, (keyof EmitTypes<T>) | (ElementType<EmitTypes<T>>)>> = {
  __emitHandlerTypes: {
    [K in keyof D]?: false extends isNeverType<ElementType<EmitTypes<T>>> ? (...args: any) => any : D[K] extends keyof EmitTypes<T> ? ToHandlerType<EmitTypes<T>[D[K]]> : never
  }
}

export type MixIntoComponent<C, T> = C extends DefineComponent<infer P, infer B, infer D, any, infer M, infer E, infer PublicProps, infer Defaults, infer MakeDefaultsOptional, infer Options> ? DefineComponent<P, B, D, any, M, E, PublicProps, Defaults, MakeDefaultsOptional, Options & T> : never;

type _RequiredProps<T> = {
  [K in keyof T]: T[K] extends {
      required: true;
  } ? K : never;
}[keyof T];

export type RequiredProps<C> = C extends DefineComponent<infer PropsOptions, infer RawBindings, infer D, any, infer M, infer Mixin, infer Extends, infer E, infer EE> ? _RequiredProps<PropsOptions> : never

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
