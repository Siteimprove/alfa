import { Primitive } from "./primitive";

type ImmutableObject<T> = { readonly [P in keyof T]: T[P] };

interface ImmutableArray<T> extends ReadonlyArray<T> {}

interface ImmutableMap<T, U> extends ReadonlyMap<T, U> {}

interface ImmutableSet<T> extends ReadonlySet<T> {}

export type Immutable<T> = T extends Primitive | Function
  ? T
  : T extends Array<infer U>
  ? ImmutableArray<U>
  : T extends Map<infer U, infer V>
  ? ImmutableMap<U, V>
  : T extends Set<infer U>
  ? ImmutableSet<U>
  : ImmutableObject<T>;
