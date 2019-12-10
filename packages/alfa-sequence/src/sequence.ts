import { Equality } from "@siteimprove/alfa-equality";
import { Foldable } from "@siteimprove/alfa-foldable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";

import { Cons } from "./cons";
import { Nil } from "./nil";

export interface Sequence<T>
  extends Monad<T>,
    Functor<T>,
    Foldable<T>,
    Iterable<T>,
    Equality<Sequence<T>> {
  readonly length: number;
  isEmpty(): boolean;
  map<U>(mapper: Mapper<T, U>): Sequence<U>;
  flatMap<U>(mapper: Mapper<T, Sequence<U>>): Sequence<U>;
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
  some(predicate: Predicate<T>): boolean;
  every(predicate: Predicate<T>): boolean;
  concat(iterable: Iterable<T>): Sequence<T>;
  filter<U extends T>(predicate: Predicate<T, U>): Sequence<U>;
  find<U extends T>(predicate: Predicate<T, U>): Option<U>;
  get(index: number): Option<T>;
  first(): Option<T>;
  last(): Option<T>;
  take(count: number): Sequence<T>;
  takeWhile(predicate: Predicate<T>): Sequence<T>;
  takeUntil(predicate: Predicate<T>): Sequence<T>;
  skip(count: number): Sequence<T>;
  skipWhile(predicate: Predicate<T>): Sequence<T>;
  skipUntil(predicate: Predicate<T>): Sequence<T>;
  rest(): Sequence<T>;
  slice(start: number, end?: number): Sequence<T>;
  reverse(): Sequence<T>;
  groupBy<K>(grouper: Mapper<T, K>): Map<K, Sequence<T>>;
  join(separator: string): string;
  toJSON(): Array<T>;
}

export namespace Sequence {
  export function isSequence<T>(value: unknown): value is Sequence<T> {
    return Cons.isCons(value) || value === Nil;
  }

  export function of<T>(head: T, tail?: Lazy<Sequence<T>>): Sequence<T> {
    return Cons.of(head, tail);
  }

  export function empty<T>(): Sequence<T> {
    return Nil;
  }

  export function from<T>(iterable: Iterable<T>): Sequence<T> {
    if (isSequence<T>(iterable)) {
      return iterable;
    }

    const iterator = iterable[Symbol.iterator]();

    const tail = (): Sequence<T> => {
      const head = iterator.next();

      if (head.done === true) {
        return empty();
      }

      return of(head.value, Lazy.of(tail));
    };

    return tail();
  }
}
