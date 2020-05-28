import { Collection } from "@siteimprove/alfa-collection";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Cons } from "./cons";
import { Nil } from "./nil";

export interface Sequence<T> extends Collection.Indexed<T> {
  // Collection<T> methods

  isEmpty(): this is Sequence<never>;
  map<U>(mapper: Mapper<T, U, [number]>): Sequence<U>;
  flatMap<U>(mapper: Mapper<T, Sequence<U>, [number]>): Sequence<U>;
  reduce<U>(reducer: Reducer<T, U, [number]>, accumulator: U): U;
  apply<U>(mapper: Sequence<Mapper<T, U>>): Sequence<U>;
  filter<U extends T>(predicate: Predicate<T, U, [number]>): Sequence<U>;
  reject(predicate: Predicate<T, T, [number]>): Sequence<T>;
  find<U extends T>(predicate: Predicate<T, U, [number]>): Option<U>;
  includes(value: T): boolean;
  some(predicate: Predicate<T, T, [number]>): boolean;
  every(predicate: Predicate<T, T, [number]>): boolean;
  count(predicate: Predicate<T, T, [number]>): number;

  // Indexed<T> methods

  get(index: number): Option<T>;
  has(index: number): boolean;
  set(index: number, value: T): Sequence<T>;
  insert(index: number, value: T): Sequence<T>;
  append(value: T): Sequence<T>;
  prepend(value: T): Sequence<T>;
  concat(iterable: Iterable<T>): Sequence<T>;
  first(): Option<T>;
  last(): Option<T>;
  take(count: number): Sequence<T>;
  takeWhile(predicate: Predicate<T, T, [number]>): Sequence<T>;
  takeUntil(predicate: Predicate<T, T, [number]>): Sequence<T>;
  takeLast(count: number): Sequence<T>;
  skip(count: number): Sequence<T>;
  skipWhile(predicate: Predicate<T, T, [number]>): Sequence<T>;
  skipUntil(predicate: Predicate<T, T, [number]>): Sequence<T>;
  skipLast(count: number): Sequence<T>;
  rest(): Sequence<T>;
  slice(start: number, end?: number): Sequence<T>;
  reverse(): Sequence<T>;
  join(separator: string): string;

  // Sequence<T> methods

  groupBy<K>(grouper: Mapper<T, K, [number]>): Map<K, Sequence<T>>;
  toArray(): Array<T>;

  // Serializable methods

  toJSON(): Sequence.JSON;
}

export namespace Sequence {
  export type JSON = Cons.JSON | Nil.JSON;

  export function isSequence<T>(value: unknown): value is Sequence<T> {
    return Cons.isCons(value) || value === Nil;
  }

  export function of<T>(head: T, tail?: Lazy<Sequence<T>>): Sequence<T> {
    return Cons.of(head, tail);
  }

  export function empty<T>(): Sequence<T> {
    return Nil;
  }

  export function flatten<T>(sequence: Sequence<Sequence<T>>): Sequence<T> {
    return sequence.flatMap((sequence) => sequence);
  }

  export function from<T>(iterable: Iterable<T>): Sequence<T> {
    if (isSequence<T>(iterable)) {
      return iterable;
    }

    if (Array.isArray(iterable)) {
      return fromArray(iterable);
    }

    return fromIterable(iterable);
  }

  export function fromIterable<T>(iterable: Iterable<T>): Sequence<T> {
    return fromIterator(iterable[Symbol.iterator]());
  }

  export function fromIterator<T>(iterator: Iterator<T>): Sequence<T> {
    const tail = (): Sequence<T> => {
      const head = iterator.next();

      if (head.done === true) {
        return empty();
      }

      return of(head.value, Lazy.of(tail));
    };

    return tail();
  }

  export function fromArray<T>(array: Array<T>): Sequence<T> {
    let i = 0;

    const tail = (): Sequence<T> => {
      if (i >= array.length) {
        return empty();
      }

      return of(array[i++], Lazy.of(tail));
    };

    return tail();
  }
}
