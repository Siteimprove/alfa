import { Primitive } from "./primitive";

type MutableObject<T> = { -readonly [P in keyof T]: T[P] };

interface MutableArray<T> extends Array<T> {}

interface MutableMap<T, U> extends Map<T, U> {}

interface MutableSet<T> extends Set<T> {}

/**
 * NB: Use this type with extreme caution! Readonly types are readonly for a
 * reason and this type will completely ignore those reasons. It is however
 * meant as an aid in constructing readonly types, which is likely the only
 * valid use case.
 */
export type Mutable<T> = T extends Primitive | Function
  ? T
  : T extends ReadonlyArray<infer U>
  ? MutableArray<U>
  : T extends ReadonlyMap<infer U, infer V>
  ? MutableMap<U, V>
  : T extends ReadonlySet<infer U>
  ? MutableSet<U>
  : MutableObject<T>;
