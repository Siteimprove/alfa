import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Collection } from "@siteimprove/alfa-collection";
import { Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
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

  public forEach(callback: Callback<T, void, [number]>): void {
    Iterable.forEach(this, callback);
  }

  public map<U>(mapper: Mapper<T, U, [number]>): Cons<U>;

  /**
   * @internal
   */
  public map<U>(mapper: Mapper<T, U, [number]>, index: number): Cons<U>;

  public map<U>(mapper: Mapper<T, U, [number]>, index = 0): Cons<U> {
    return new Cons(
      mapper(this._head, index),
      this._tail.map((tail) =>
        Cons.isCons(tail) ? tail.map(mapper, index - 1) : tail.map(mapper)
      )
    );
  }

  public flatMap<U>(mapper: Mapper<T, Sequence<U>, [number]>): Sequence<U>;

  /**
   * @internal
   */
  public flatMap<U>(
    mapper: Mapper<T, Sequence<U>, [number]>,
    index: number
  ): Sequence<U>;

  public flatMap<U>(
    mapper: Mapper<T, Sequence<U>, [number]>,
    index = 0
  ): Sequence<U> {
    let next: Cons<T> = this;

    while (true) {
      const head = mapper(next._head, index);

      if (Cons.isCons<U>(head)) {
        return new Cons(
          head._head,
          head._tail.flatMap((left) =>
            next._tail.map((right) =>
              left.concat(
                Cons.isCons(right)
                  ? right.flatMap(mapper, index + 1)
                  : right.flatMap(mapper)
              )
            )
          )
        );
      }

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
        index++;
      } else {
        return Nil;
      }
    }
  }

  public reduce<U>(reducer: Reducer<T, U, [number]>, accumulator: U): U {
    let next: Cons<T> = this;
    let index = 0;

    while (true) {
      accumulator = reducer(accumulator, next._head, index++);

      const tail = next._tail.force();

      if (Cons.isCons(tail)) {
        next = tail;
      } else {
        return accumulator;
      }
    }
  }

  public apply<U>(mapper: Sequence<Mapper<T, U>>): Sequence<U> {
    return this.flatMap((value) => mapper.map((mapper) => mapper(value)));
  }

  public filter<U extends T>(
    refinement: Refinement<T, U, [number]>
  ): Sequence<U>;

  public filter(predicate: Predicate<T, [number]>): Sequence<T>;

  /**
   * @internal
   */
  public filter(predicate: Predicate<T, [number]>, index: number): Sequence<T>;

  public filter(predicate: Predicate<T, [number]>, index = 0): Sequence<T> {
    let next: Cons<T> = this;

    while (true) {
      if (predicate(next._head, index++)) {
        return new Cons(
          next._head,
          next._tail.map((tail) =>
            Cons.isCons(tail)
              ? tail.filter(predicate, index)
              : tail.filter(predicate)
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
    refinement: Refinement<T, U, [number]>
  ): Sequence<Exclude<T, U>>;

  public reject(predicate: Predicate<T, [number]>): Sequence<T>;

  public reject(predicate: Predicate<T, [number]>): Sequence<T> {
    return this.filter(not(predicate));
  }

  public find<U extends T>(refinement: Refinement<T, U, [number]>): Option<U>;

  public find(predicate: Predicate<T, [number]>): Option<T>;

  public find(predicate: Predicate<T, [number]>): Option<T> {
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

  public collect<U>(
    mapper: Mapper<T, Option<U>, [number]>,
    index: number = 0
  ): Sequence<U> {
    let next: Cons<T> = this;

    while (true) {
      const value = mapper(next._head, index++);

      if (value.isSome()) {
        return new Cons(
          value.get(),
          next._tail.map((tail) =>
            Cons.isCons(tail)
              ? tail.collect(mapper, index)
              : tail.collect(mapper)
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

  public collectFirst<U>(mapper: Mapper<T, Option<U>, [number]>): Option<U> {
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

  public some(predicate: Predicate<T, [number]>): boolean {
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

  public none(predicate: Predicate<T, [number]>): boolean {
    return this.every(not(predicate));
  }

  public every(predicate: Predicate<T, [number]>): boolean {
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

  public count(predicate: Predicate<T, [number]>): number {
    return this.reduce(
      (count, value, index) => (predicate(value, index) ? count + 1 : count),
      0
    );
  }

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
          this._tail.map((tail) =>
            Cons.isCons(tail)
              ? tail.distinct(seen.add(next._head))
              : tail.distinct()
          )
        );
      }
    }
  }

  public get(index: number): Option<T> {
    return index < 0 ? None : this.skip(index).first();
  }

  public has(index: number): boolean {
    return this.skip(index).first().isSome();
  }

  public set(index: number, value: T): Cons<T> {
    if (index < 0) {
      return this;
    }

    if (index === 0) {
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
    if (iterable === Nil) {
      return this;
    }

    return new Cons(
      this._head,
      this._tail.map((tail) => tail.concat(iterable))
    );
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
    return this.takeWhile(() => count-- > 0);
  }

  public takeWhile(predicate: Predicate<T, [number]>): Sequence<T> {
    return this.takeUntil(not(predicate));
  }

  public takeUntil(predicate: Predicate<T, [number]>): Sequence<T>;

  /**
   * @internal
   */
  public takeUntil(
    predicate: Predicate<T, [number]>,
    index: number
  ): Sequence<T>;

  public takeUntil(predicate: Predicate<T, [number]>, index = 0): Sequence<T> {
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

  public skip(count: number): Sequence<T> {
    return this.skipWhile(() => count-- > 0);
  }

  public skipWhile(predicate: Predicate<T, [number]>): Sequence<T> {
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

  public skipUntil(predicate: Predicate<T, [number]>): Sequence<T> {
    return this.skipWhile(not(predicate));
  }

  public skipLast(count: number): Sequence<T> {
    return this.take(this.size - count);
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

  public sortWith(comparer: Comparer<T>): Sequence<T> {
    return Sequence.fromArray(Array.sortWith(this.toArray(), comparer));
  }

  public compareWith(iterable: Iterable<T>, comparer: Comparer<T>): Comparison {
    return Iterable.compareWith(this, iterable, comparer);
  }

  public groupBy<K>(grouper: Mapper<T, K, [number]>): Map<K, Sequence<T>> {
    return this.reduce((groups, value, index) => {
      const group = grouper(value, index);

      return groups.set(
        group,
        new Cons(value, Lazy.force(groups.get(group).getOrElse(() => Nil)))
      );
    }, Map.empty<K, Sequence<T>>()).map((group) => group.reverse());
  }

  public subtract(iterable: Iterable<T>): Sequence<T> {
    return this.filter((value) => !Iterable.includes(iterable, value));
  }

  public intersect(iterable: Iterable<T>): Sequence<T> {
    return this.filter((value) => Iterable.includes(iterable, value));
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
      Hashable.hash(hash, value);
      size++;
    }

    Hash.writeUint32(hash, size);
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

export namespace Cons {
  export type JSON<T> = Collection.Indexed.JSON<T>;

  export function isCons<T>(value: Iterable<T>): value is Cons<T>;

  export function isCons<T>(value: unknown): value is Cons<T>;

  export function isCons<T>(value: unknown): value is Cons<T> {
    return value instanceof Cons;
  }
}
