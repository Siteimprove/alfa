import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Comparer } from "@siteimprove/alfa-comparable";
import { Hash } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

/**
 * @public
 */
export type Tuple<T extends ReadonlyArray<unknown> = ReadonlyArray<unknown>> =
  T;

/**
 * @public
 */
export namespace Tuple {
  export type Item<T extends Tuple> = T[number];

  export function of<T extends Tuple>(...values: T): T {
    return values;
  }

  export type Empty = [];

  export function empty(): Empty {
    return [];
  }

  export type Size<T extends Tuple> = T["length"];

  export function size<T extends Tuple>(tuple: T): Size<T> {
    return Array.size(tuple);
  }

  export type Copy<T extends Tuple> = T extends readonly [...infer T]
    ? T
    : Empty;

  export function copy<T extends Tuple>(tuple: T): Copy<T> {
    return Array.copy(tuple) as Copy<T>;
  }

  export function forEach<T extends Tuple>(
    tuple: T,
    callback: Callback<Item<T>, void, [index: number]>
  ): void {
    Array.forEach(tuple, callback);
  }

  export type Map<T extends Tuple, U> = T extends readonly [infer _, ...infer R]
    ? [U, ...Map<R, U>]
    : Empty;

  export function map<T extends Tuple, U>(
    tuple: T,
    mapper: Mapper<Item<T>, U, [index: number]>
  ): Map<T, U> {
    return Array.map(tuple, mapper) as unknown as Map<T, U>;
  }

  export function reduce<T extends Tuple, U>(
    tuple: T,
    reducer: Reducer<Item<T>, U, [index: number]>,
    accumulator: U
  ): U {
    return Array.reduce(tuple, reducer, accumulator);
  }

  export function reduceWhile<T extends Tuple, U>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>,
    reducer: Reducer<Item<T>, U, [index: number]>,
    accumulator: U
  ): U {
    return Array.reduceWhile(tuple, predicate, reducer, accumulator);
  }

  export function reduceUntil<T extends Tuple, U>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>,
    reducer: Reducer<Item<T>, U, [index: number]>,
    accumulator: U
  ): U {
    return Array.reduceUntil(tuple, predicate, reducer, accumulator);
  }

  export type Filter<T extends Tuple, U extends Item<T>> = T extends readonly [
    infer H,
    ...infer R
  ]
    ? H extends U
      ? [H, ...Filter<R, U>]
      : Filter<R, U>
    : Empty;

  export function filter<T extends Tuple, U extends Item<T>>(
    tuple: T,
    refinement: Refinement<Item<T>, U, [index: number]>
  ): Filter<T, U>;

  export function filter<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Array<Item<T>>;

  export function filter<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Array<Item<T>> {
    return Array.filter(tuple, predicate);
  }

  export type Reject<T extends Tuple, U extends Item<T>> = Filter<
    T,
    Exclude<Item<T>, U>
  >;

  export function reject<T extends Tuple, U extends Item<T>>(
    tuple: T,
    refinement: Refinement<Item<T>, U, [index: number]>
  ): Reject<T, U>;

  export function reject<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Array<Item<T>>;

  export function reject<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Array<Item<T>> {
    return Array.filter(tuple, predicate);
  }

  export function find<T extends Tuple, U extends Item<T>>(
    tuple: T,
    refinement: Refinement<Item<T>, U, [index: number]>
  ): Option<U>;

  export function find<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Option<Item<T>>;

  export function find<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Option<Item<T>> {
    return Array.find(tuple, predicate);
  }

  export function findLast<T extends Tuple, U extends Item<T>>(
    tuple: T,
    refinement: Refinement<Item<T>, U, [index: number]>
  ): Option<U>;

  export function findLast<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Option<Item<T>>;

  export function findLast<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): Option<Item<T>> {
    return Array.findLast(tuple, predicate);
  }

  export function includes<T extends Tuple>(tuple: T, value: Item<T>): boolean {
    return Array.includes(tuple, value);
  }

  export function collect<T extends Tuple, U>(
    tuple: T,
    mapper: Mapper<Item<T>, Option<U>, [index: number]>
  ): Array<U> {
    return Array.collect(tuple, mapper);
  }

  export function collectFirst<T extends Tuple, U>(
    tuple: T,
    mapper: Mapper<Item<T>, Option<U>, [index: number]>
  ): Option<U> {
    return Array.collectFirst(tuple, mapper);
  }

  export function some<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): boolean {
    return Array.some(tuple, predicate);
  }

  export function none<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): boolean {
    return Array.none(tuple, predicate);
  }

  export function every<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): boolean {
    return Array.every(tuple, predicate);
  }

  export function count<T extends Tuple>(
    tuple: T,
    predicate: Predicate<Item<T>, [index: number]>
  ): number {
    return Array.count(tuple, predicate);
  }

  export type Get<T extends Tuple, I extends number> = GetInner<T, I, Empty>;

  type GetInner<
    T extends Tuple,
    I extends number,
    S extends Tuple
  > = T extends readonly [infer H, ...infer R]
    ? I extends Size<S>
      ? H
      : GetInner<R, I, Append<S, H>>
    : never;

  export function get<T extends Tuple, I extends number>(
    tuple: T,
    index: I
  ): Option<Get<T, I>> {
    return Array.get(tuple, index) as Option<Get<T, I>>;
  }

  export type Has<T extends Tuple, I extends number> = Get<T, I> extends never
    ? false
    : true;

  export function has<T extends Tuple, I extends number>(
    tuple: T,
    index: I
  ): Has<T, I> {
    return Array.has(tuple, index) as Has<T, I>;
  }

  export type Set<T extends Tuple, I extends number, V> = SetInner<
    T,
    I,
    V,
    Empty
  >;

  type SetInner<
    T extends Tuple,
    I extends number,
    V,
    S extends Tuple
  > = T extends readonly [infer H, ...infer R]
    ? I extends Size<S>
      ? [V, ...R]
      : [H, ...SetInner<R, I, V, Append<S, H>>]
    : T;

  export function set<T extends Tuple, I extends number, V>(
    tuple: T,
    index: I,
    value: V
  ): Set<T, I, V> {
    return Array.set(copy(tuple), index, value) as Set<T, I, V>;
  }

  export type Insert<T extends Tuple, I extends number, V> = InsertInner<
    T,
    I,
    V,
    Empty
  >;

  type InsertInner<
    T extends Tuple,
    I extends number,
    V,
    S extends Tuple
  > = I extends Size<T>
    ? Append<T, V>
    : T extends readonly [infer H, ...infer R]
    ? I extends Size<S>
      ? [V, H, ...R]
      : [H, ...InsertInner<R, I, V, Append<S, H>>]
    : T;

  export function insert<T extends Tuple, I extends number, V>(
    tuple: T,
    index: I,
    value: V
  ): Insert<T, I, V> {
    return Array.insert(copy(tuple), index, value) as Insert<T, I, V>;
  }

  export type Append<T extends Tuple, V> = [...T, V];

  export function append<T extends Tuple, V>(tuple: T, value: V): Append<T, V> {
    return Array.append(copy(tuple), value) as unknown as Append<T, V>;
  }

  export type Prepend<T extends Tuple, V> = [V, ...T];

  export function prepend<T extends Tuple, V>(
    tuple: T,
    value: V
  ): Prepend<T, V> {
    return Array.prepend(copy(tuple), value) as unknown as Prepend<T, V>;
  }

  export type First<T extends Tuple> = T extends readonly [infer H, ...infer _]
    ? H
    : never;

  export function first<T extends Tuple>(tuple: T): Option<First<T>> {
    return Array.first(tuple) as Option<First<T>>;
  }

  export type Last<T extends Tuple> = T extends readonly [infer H, ...infer R]
    ? R extends Empty
      ? H
      : Last<R>
    : never;

  export function last<T extends Tuple>(tuple: T): Option<Last<T>> {
    return Array.last(tuple) as Option<Last<T>>;
  }

  export type Take<T extends Tuple, N extends number> = TakeInner<T, N, Empty>;

  type TakeInner<
    T extends Tuple,
    N extends number,
    A extends Tuple
  > = T extends readonly [infer H, ...infer R]
    ? N extends Size<A>
      ? A
      : TakeInner<R, N, Append<A, H>>
    : Empty;

  export type Skip<T extends Tuple, N extends number> = SkipInner<T, N, Empty>;

  type SkipInner<
    T extends Tuple,
    N extends number,
    A extends Tuple
  > = T extends readonly [infer H, ...infer R]
    ? N extends Size<A>
      ? T
      : SkipInner<R, N, Append<A, H>>
    : Empty;

  export type Rest<T extends Tuple> = T extends readonly [infer _, ...infer R]
    ? R
    : Empty;

  export type Reverse<T extends Tuple> = T extends readonly [
    infer H,
    ...infer R
  ]
    ? [...Reverse<R>, H]
    : Empty;

  export function search<T extends Tuple>(
    tuple: T,
    value: Item<T>,
    comparer: Comparer<Item<T>>
  ): number {
    return Array.search(tuple, value, comparer);
  }

  export function equals<T extends Tuple>(a: T, b: T): boolean {
    return Array.equals(a, b);
  }

  export function hash<T extends Tuple>(tuple: T, hash: Hash): void {
    Array.hash(tuple, hash);
  }

  export function iterator<T extends Tuple>(tuple: T): Iterator<Item<T>> {
    return Array.iterator(tuple);
  }
}
