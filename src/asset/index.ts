export const GLOBAL_TYPES_FILE = {
  name: '__GLOBAL_TYPES.d.ts',
  content: `
  import { ComponentPublicInstance } from 'vue'

  export type ClassInstance<T> = T extends new (...args: any[]) => infer U ? U : never;

  export type PropTyps<C> = C extends ComponentPublicInstance<infer P, infer B, infer D, infer C, infer M> ? P : never
`
}
