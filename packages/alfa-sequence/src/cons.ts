import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Collection } from "@siteimprove/alfa-collection";
import { Comparable, Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Set } from "@siteimprove/alfa-set";

import { Sequence } from "./sequence";
import { Nil } from "./nil";

const { not, equals } = Predicate;
const { compareComparable } = Comparable;

/**
 * @public
 */
export class Cons<T> implements Sequence<T> {
  public static of<T>(
    head: T,
    tail: Lazy<Sequence<T>> = Lazy.force(Nil)
  ): Cons<T> {
    return new Cons(head, tail);
  }

  private readonly _head: T;
  private readonly _tail: Lazy<Sequence<T>>;

  private constructor(head: T, tail: Lazy<Sequence<T>>) {
    this._head = head;
    this._tail = tail;
  }

  public get size(): number {
    return Iterable.size(this);
  }

  public isEmpty(): this is Sequence<never> {
    return false;
  }

  public forEach(callback: Callback<T, void, [index: number]>): void {
    Iterable.forEach(this, callback);
  }

  public map<U>(mapper: Mapper<T, U, [index: number]>): Cons<U>;

  /**
   * @internal
   */
  public map<U>(mapper: Mapper<T, U, [index: number]>, index: number): Cons<U>;

  public map<U>(mapper: Mapper<T, U, [index: number]>, index = 0): Cons<U> {
    return new Cons(
      mapper(this._head, index),
      this._tail.map((tail) =>
        Cons.isCons(tail) ? tail.map(mapper, index + 1) : Nil
      )
    );
  }

  public apply<U>(mapper: Sequence<Mapper<T, U>>): Sequence<U> {
    return mapper.flatMap((mapper) => this.map(mapper));
  }

  public flatMap<U>(
    mapper: Mapper<T, Sequence<U>, [index: number]>
  ): Sequence<U>;

  /**
   * @internal
   */
  public flatMap<U>(
    mapper: Mapper<T, Sequence<U>, [index: number]>,
    index: number
  ): Sequence<U>;

  public flatMap<U>(
    mapper: Mapper<T, Sequence<U>, [index: number]>,
    index = 0
  ): Sequence<U> {
    let next: Cons<T> = this;

    while (true) {
      const head = mapper(next._head, index++);

      if (Cons.isCons<U>(head)) {
        return new Cons(
          head._head,
          head._tail.map((left) => {
            const right = next._tail.force();

            return Cons.isCons(right)
              ? left.concat(right.flatMap(mapper, index))
              : left;
          })
        );
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }
  }

  public flatten<T>(this: Sequence<Sequence<T>>): Sequence<T> {
    return this.flatMap((sequence) => sequence);
  }

  public reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U {
    let next: Cons<T> = this;
    let index = 0;

    while (true) {
      accumulator = reducer(accumulator, next._head, index++);

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        break;
      }
    }

    return accumulator;
  }

  public reduceWhile<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    let next: Cons<T> = this;
    let index = 0;

    while (predicate(next._head, index)) {
      accumulator = reducer(accumulator, next._head, index++);

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        break;
      }
    }

    return accumulator;
  }

  public reduceUntil<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    return this.reduceWhile(not(predicate), reducer, accumulator);
  }

  public filter<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Sequence<U>;

  public filter(predicate: Predicate<T, [index: number]>): Sequence<T>;

  /**
   * @internal
   */
  public filter(
    predicate: Predicate<T, [index: number]>,
    index: number
  ): Sequence<T>;

  public filter(
    predicate: Predicate<T, [index: number]>,
    index = 0
  ): Sequence<T> {
    let next: Cons<T> = this;

    while (true) {
      if (predicate(next._head, index++)) {
        return new Cons(
          next._head,
          next._tail.map((tail) =>
            Cons.isCons(tail) ? tail.filter(predicate, index) : Nil
          )
        );
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }
  }

  public reject<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Sequence<Exclude<T, U>>;

  public reject(predicate: Predicate<T, [index: number]>): Sequence<T>;

  public reject(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.filter(not(predicate));
  }

  public find<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Option<U>;

  public find(predicate: Predicate<T, [index: number]>): Option<T>;

  public find(predicate: Predicate<T, [index: number]>): Option<T> {
    let next: Cons<T> = this;
    let index = 0;

    while (true) {
      const head = next._head;

      if (predicate(head, index++)) {
        return Option.of(head);
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return None;
      }
    }
  }

  public includes(value: T): boolean {
    return this.some(equals(value));
  }

  public collect<U>(mapper: Mapper<T, Option<U>, [index: number]>): Sequence<U>;

  /**
   * @internal
   */
  public collect<U>(
    mapper: Mapper<T, Option<U>, [index: number]>,
    index: number
  ): Sequence<U>;

  public collect<U>(
    mapper: Mapper<T, Option<U>, [index: number]>,
    index: number = 0
  ): Sequence<U> {
    let next: Cons<T> = this;

    while (true) {
      const value = mapper(next._head, index++);

      if (value.isSome()) {
        return new Cons(
          value.get(),
          next._tail.map((tail) =>
            Cons.isCons(tail) ? tail.collect(mapper, index) : Nil
          )
        );
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }
  }

  public collectFirst<U>(
    mapper: Mapper<T, Option<U>, [index: number]>
  ): Option<U> {
    let next: Cons<T> = this;
    let index = 0;

    while (true) {
      const value = mapper(next._head, index++);

      if (value.isSome()) {
        return value;
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return None;
      }
    }
  }

  public some(predicate: Predicate<T, [index: number]>): boolean {
    let next: Cons<T> = this;
    let index = 0;

    while (true) {
      if (predicate(next._head, index++)) {
        return true;
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return false;
      }
    }
  }

  public none(predicate: Predicate<T, [index: number]>): boolean {
    return this.every(not(predicate));
  }

  public every(predicate: Predicate<T, [index: number]>): boolean {
    let next: Cons<T> = this;
    let index = 0;

    while (true) {
      if (!predicate(next._head, index++)) {
        return false;
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return true;
      }
    }
  }

  public count(predicate: Predicate<T, [index: number]>): number {
    return this.reduce(
      (count, value, index) => (predicate(value, index) ? count + 1 : count),
      0
    );
  }

  public distinct(): Sequence<T>;

  /**
   * @internal
   */
  public distinct(seen: Set<T>): Sequence<T>;

  public distinct(seen: Set<T> = Set.empty()): Sequence<T> {
    let next: Cons<T> = this;

    while (true) {
      if (seen.has(next._head)) {
        const tail = next._tail.force();

        if (Cons.isCons(tail)) {
          next = tail;
        } else {
          return Nil;
        }
      } else {
        return Cons.of(
          next._head,
          next._tail.map((tail) =>
            Cons.isCons(tail) ? tail.distinct(seen.add(next._head)) : Nil
          )
        );
      }
    }
  }

  public get(index: number): Option<T> {
    return index < 0 ? None : this.skip(index).first();
  }

  public has(index: number): boolean {
    return this.get(index).isSome();
  }

  public set(index: number, value: T): Cons<T> {
    if (index < 0) {
      return this;
    }

    if (index === 0) {
      if (Equatable.equals(value, this._head)) {
        return this;
      }

      return new Cons(value, this._tail);
    }

    return new Cons(
      this._head,
      this._tail.map((tail) => tail.set(index - 1, value))
    );
  }

  public insert(index: number, value: T): Cons<T> {
    if (index < 0) {
      return this;
    }

    if (index === 0) {
      return new Cons(value, Lazy.force(this));
    }

    return new Cons(
      this._head,
      this._tail.map((tail) => tail.set(index - 1, value))
    );
  }

  public append(value: T): Cons<T> {
    return new Cons(
      this._head,
      this._tail.map((tail) => tail.append(value))
    );
  }

  public prepend(value: T): Cons<T> {
    return new Cons(value, Lazy.force(this));
  }

  public concat(iterable: Iterable<T>): Cons<T> {
    const sequence = Sequence.from(iterable);

    if (Cons.isCons(sequence)) {
      return new Cons(
        this._head,
        this._tail.map((tail) => tail.concat(sequence))
      );
    }

    return this;
  }

  public subtract(iterable: Iterable<T>): Sequence<T> {
    return this.filter((value) => !Iterable.includes(iterable, value));
  }

  public intersect(iterable: Iterable<T>): Sequence<T> {
    return this.filter((value) => Iterable.includes(iterable, value));
  }

  public zip<U>(iterable: Iterable<U>): Sequence<[T, U]> {
    const sequence = Sequence.from(iterable);

    if (Cons.isCons(sequence)) {
      return new Cons(
        [this._head, sequence._head],
        this._tail.map((tail) => tail.zip(sequence.rest()))
      );
    }

    return Nil;
  }

  public first(): Option<T> {
    return Option.of(this._head);
  }

  public last(): Option<T> {
    let next: Cons<T> = this;

    while (true) {
      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return Option.of(next._head);
      }
    }
  }

  public take(count: number): Sequence<T> {
    if (count <= 0) {
      return Nil;
    }

    return new Cons(
      this._head,
      count === 1
        ? Lazy.force(Nil)
        : this._tail.map((tail) =>
            Cons.isCons(tail) ? tail.take(count - 1) : Nil
          )
    );
  }

  public takeWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Sequence<U>;

  public takeWhile(predicate: Predicate<T, [index: number]>): Sequence<T>;

  public takeWhile(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.takeUntil(not(predicate));
  }

  public takeUntil(predicate: Predicate<T, [index: number]>): Sequence<T>;

  /**
   * @internal
   */
  public takeUntil(
    predicate: Predicate<T, [index: number]>,
    index: number
  ): Sequence<T>;

  public takeUntil(
    predicate: Predicate<T, [index: number]>,
    index = 0
  ): Sequence<T> {
    if (predicate(this._head, index)) {
      return Nil;
    }

    return new Cons(
      this._head,
      this._tail.map((tail) =>
        Cons.isCons(tail)
          ? tail.takeUntil(predicate, index + 1)
          : tail.takeUntil(predicate)
      )
    );
  }

  public takeLast(count: number): Sequence<T> {
    return this.skip(this.size - count);
  }

  public takeLastWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Sequence<U>;

  public takeLastWhile(predicate: Predicate<T, [index: number]>): Sequence<T>;

  public takeLastWhile(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.reverse().takeWhile(predicate).reverse();
  }

  public takeLastUntil(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.takeLastWhile(not(predicate));
  }

  public skip(count: number): Sequence<T> {
    let next: Cons<T> = this;

    while (count-- > 0) {
      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }

    return next;
  }

  public skipWhile(predicate: Predicate<T, [index: number]>): Sequence<T> {
    let next: Cons<T> = this;
    let index = 0;

    while (predicate(next._head, index++)) {
      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return Nil;
      }
    }

    return next;
  }

  public skipUntil(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.skipWhile(not(predicate));
  }

  public skipLast(count: number): Sequence<T> {
    return this.take(this.size - count);
  }

  public skipLastWhile(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.reverse().skipWhile(predicate).reverse();
  }

  public skipLastUntil(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.skipLastWhile(not(predicate));
  }

  public trim(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.trimLeading(predicate).trimTrailing(predicate);
  }

  public trimLeading(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.skipWhile(predicate);
  }

  public trimTrailing(predicate: Predicate<T, [index: number]>): Sequence<T> {
    return this.skipLastWhile(predicate);
  }

  public rest(): Sequence<T> {
    return this._tail.force();
  }

  public slice(start: number, end?: number): Sequence<T> {
    let slice = this.skip(start);

    if (end !== undefined) {
      slice = slice.take(end - start);
    }

    return slice;
  }

  public reverse(): Sequence<T> {
    return this.reduce<Sequence<T>>(
      (reversed, value) => new Cons(value, Lazy.force(reversed)),
      Nil
    );
  }

  public join(separator: string): string {
    let result = `${this._head}`;

    let next: Cons<T> = this;

    while (true) {
      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        result += `${separator}${tail._head}`;
        next = tail;
      } else {
        return result;
      }
    }
  }

  public sort<T extends Comparable<T>>(this: Sequence<T>): Sequence<T> {
    return this.sortWith(compareComparable);
  }

  public sortWith(comparer: Comparer<T>): Sequence<T> {
    return Sequence.fromArray(Array.sortWith(this.toArray(), comparer));
  }

  public compare<T>(
    this: Sequence<Comparable<T>>,
    iterable: Iterable<T>
  ): Comparison {
    return this.compareWith(iterable, Comparable.compare);
  }

  public compareWith<U = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>
  ): Comparison {
    return Iterable.compareWith(this, iterable, comparer);
  }

  public groupBy<K>(
    grouper: Mapper<T, K, [index: number]>
  ): Map<K, Sequence<T>> {
    return this.reduce((groups, value, index) => {
      const group = grouper(value, index);

      return groups.set(
        group,
        new Cons(value, Lazy.force(groups.get(group).getOrElse(() => Nil)))
      );
    }, Map.empty<K, Sequence<T>>()).map((group) => group.reverse());
  }

  public equals(value: unknown): value is this {
    if (!Cons.isCons<T>(value)) {
      return false;
    }

    let a: Cons<T> = this;
    let b: Cons<T> = value;

    while (true) {
      if (!Equatable.equals(a._head, b._head)) {
        return false;
      }

      const ta = a._tail.force();
      const tb = b._tail.force();

      if (Cons.isCons(ta) && Cons.isCons(tb)) {
        a = ta;
        b = tb;
      } else {
        return ta === Nil && tb === Nil;
      }
    }
  }

  public hash(hash: Hash): void {
    let size = 0;

    for (const value of this) {
      hash.writeUnknown(value);
      size++;
    }

    hash.writeUint32(size);
  }

  public *iterator(): Iterator<T> {
    let next: Cons<T> = this;

    while (true) {
      yield next._head;

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        break;
      }
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    return this.iterator();
  }

  public toArray(): Array<T> {
    const array: Array<T> = [];

    let next: Cons<T> = this;

    while (true) {
      array.push(next._head);

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return array;
      }
    }
  }

  public toJSON(): Cons.JSON<T> {
    const json: Cons.JSON<T> = [];

    let next: Cons<T> = this;

    while (true) {
      json.push(Serializable.toJSON(next._head));

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return json;
      }
    }
  }

  public toString(): string {
    return `Sequence [ ${this.join(", ")} ]`;
  }
}

/**
 * @public
 */
export namespace Cons {
  export type JSON<T> = Collection.Indexed.JSON<T>;

  export function isCons<T>(value: Iterable<T>): value is Cons<T>;

  export function isCons<T>(value: unknown): value is Cons<T>;

  export function isCons<T>(value: unknown): value is Cons<T> {
    return value instanceof Cons;
  }
}
