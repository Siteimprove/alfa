import { Primitive } from "./primitive";

type MutableObject<T> = { -readonly [P in keyof T]: Mutable<T[P]> };

interface MutableArray<T> extends Array<Mutable<T>> {}

interface MutableMap<T, U> extends Map<Mutable<T>, Mutable<U>> {}

interface MutableSet<T> extends Set<Mutable<T>> {}

/**
 * NB: Use this type with extreme caution! Readonly types are readonly for a
 * reason and this type will completely ignore those reasons. It is however
 * meant as an aid in constructing readonly types, which is likely the only
 * valid use case.
 */
export type Mutable<T> = T extends Primitive | Function
  ? T
  : T extends Readonly<infer U>
  ? U
  : T extends ReadonlyArray<infer U>
  ? MutableArray<U>
  : T extends ReadonlyMap<infer U, infer V>
  ? MutableMap<U, V>
  : T extends ReadonlySet<infer U>
  ? MutableSet<U>
  : MutableObject<T>;
