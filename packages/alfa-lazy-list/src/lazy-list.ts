import type { Array } from "@siteimprove/alfa-array";
import type { Callback } from "@siteimprove/alfa-callback";
import type { Collection } from "@siteimprove/alfa-collection";
import {
  Comparable,
  type Comparer,
  type Comparison,
} from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Reducer } from "@siteimprove/alfa-reducer";
import type { Refinement } from "@siteimprove/alfa-refinement";

const { not, equals } = Predicate;
const { compareComparable } = Comparable;

export class LazyList<T> {
  private _cache: Array<T> = [];
  private _source: Iterator<T>;
  private _done = false;

  public static of<T>(...items: Array<T>): LazyList<T> {
    return LazyList.from(items);
  }

  public static from<T>(iterable: Iterable<T>): LazyList<T> {
    return new LazyList(iterable[Symbol.iterator]());
  }

  private static _empty = new LazyList<never>((function* () {})());
  public static empty<T>(): LazyList<T> {
    return LazyList._empty;
  }

  constructor(source: Iterator<T>) {
    this._source = source;
  }

  public [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const self = this;

    return {
      next(): IteratorResult<T> {
        if (index < self._cache.length) {
          return { value: self._cache[index++], done: false };
        }

        if (self._done) {
          return { value: undefined as any, done: true };
        }

        const res = self._source.next();
        if (res.done) {
          self._done = true;
          return { value: undefined as any, done: true };
        }

        self._cache.push(res.value);
        index++;
        return { value: res.value, done: false };
      },
    };
  }

  public isEmpty(): this is LazyList<never> {
    for (const _ of this) {
      return false;
    }
    return true;
  }

  public get size(): number {
    let count = 0;
    for (const _ of this) {
      count++;
    }
    return count;
  }

  public forEach(callback: Callback<T, void, [index: number]>): void {
    let index = 0;
    for (const next of this) {
      callback(next, index++);
    }
  }

  public map<U>(mapper: Mapper<T, U, [index: number]>): LazyList<U> {
    const self = this;
    function* gen() {
      let index = 0;
      for (const next of self) {
        yield mapper(next, index++);
      }
    }
    return new LazyList(gen());
  }

  public flatMap<U>(
    mapper: Mapper<T, LazyList<U>, [index: number]>,
  ): LazyList<U> {
    const self = this;
    function* gen() {
      let index = 0;
      for (const next of self) {
        const mapped = mapper(next, index++);
        for (const item of mapped) {
          yield item;
        }
      }
    }
    return new LazyList(gen());
  }

  public apply<U>(mapper: LazyList<Mapper<T, U>>): LazyList<U> {
    return mapper.flatMap((mapper) => this.map(mapper));
  }

  public flatten<T>(this: LazyList<LazyList<T>>): LazyList<T> {
    return this.flatMap((list) => list);
  }

  public reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U {
    let index = 0;
    for (const value of this) {
      accumulator = reducer(accumulator, value, index++);
    }
    return accumulator;
  }

  public reduceUntil<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    let index = 0;
    for (const value of this) {
      if (predicate(value, index)) {
        break;
      }
      accumulator = reducer(accumulator, value, index++);
    }
    return accumulator;
  }

  public reduceWhile<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U,
  ): U {
    return this.reduceUntil(not(predicate), reducer, accumulator);
  }

  public filter<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): LazyList<U>;
  public filter(predicate: Predicate<T, [index: number]>): LazyList<T>;
  public filter(predicate: Predicate<T, [index: number]>): LazyList<T> {
    const self = this;
    let index = 0;
    function* gen() {
      for (const next of self) {
        if (predicate(next, index++)) {
          yield next;
        }
      }
    }
    return new LazyList(gen());
  }

  public reject<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): LazyList<Exclude<T, U>>;

  public reject(predicate: Predicate<T, [index: number]>): LazyList<T>;

  public reject(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.filter(not(predicate));
  }

  public find<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): Option<U>;

  public find(predicate: Predicate<T, [index: number]>): Option<T>;

  public find(predicate: Predicate<T, [index: number]>): Option<T> {
    let index = 0;
    for (const next of this) {
      if (predicate(next, index++)) {
        return Option.of(next);
      }
    }

    return None;
  }

  public includes(value: T): boolean {
    return this.some(equals(value));
  }

  public collect<U>(mapper: Mapper<T, Option<U>, [index: number]>): LazyList<U>;

  /**
   * @internal
   */
  public collect<U>(
    mapper: Mapper<T, Option<U>, [index: number]>,
    index: number,
  ): LazyList<U>;

  public collect<U>(
    mapper: Mapper<T, Option<U>, [index: number]>,
  ): LazyList<U> {
    const self = this;
    function* gen() {
      let index = 0;
      for (const next of self) {
        const opt = mapper(next, index++);
        if (opt.isSome()) {
          yield opt.get();
        }
      }
    }

    return new LazyList(gen());
  }

  public collectFirst<U>(
    mapper: Mapper<T, Option<U>, [index: number]>,
  ): Option<U> {
    return this.collect(mapper).first();
  }

  public some(predicate: Predicate<T, [index: number]>): boolean {
    let index = 0;
    for (const value of this) {
      if (predicate(value, index++)) {
        return true;
      }
    }
    return false;
  }

  public every(predicate: Predicate<T, [index: number]>): boolean {
    let index = 0;
    for (const value of this) {
      if (!predicate(value, index++)) {
        return false;
      }
    }
    return true;
  }

  public none(predicate: Predicate<T, [index: number]>): boolean {
    let index = 0;
    for (const value of this) {
      if (predicate(value, index++)) {
        return false;
      }
    }
    return true;
  }

  public count(predicate: Predicate<T, [index: number]>): number {
    let index = 0;
    let count = 0;
    for (const value of this) {
      if (predicate(value, index++)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Counts elements in the lazy list until a predicate condition is met, optionally filtering elements to count.
   *
   * @param predicate - The stopping condition. Iteration stops when this returns true.
   * @param filter - Optional predicate to filter which elements are counted. If not provided, all elements before the stopping condition are counted.
   */
  public countUntil(
    predicate: Predicate<T, [index: number]>,
    filter: Predicate<T, [index: number]> = () => true,
  ): number {
    let index = 0;
    let count = 0;

    for (const value of this) {
      if (predicate(value, index)) {
        return count;
      }

      if (filter(value, index)) {
        count++;
      }

      index++;
    }
    return count;
  }

  public distinct(): LazyList<T> {
    const self = this;
    function* gen() {
      let seen = new Set();
      for (const next of self) {
        if (!seen.has(next)) {
          seen.add(next);
          yield next;
        }
      }
    }
    return new LazyList(gen());
  }

  public get(index: number): Option<T> {
    if (index < 0) {
      return None;
    }

    let currentIndex = 0;
    for (const value of this) {
      if (currentIndex === index) {
        return Option.of(value);
      }
      currentIndex++;
    }

    return None;
  }

  public has(index: number): boolean {
    return this.get(index).isSome();
  }

  /**
   * Replaces the element at the specified index with a new value.
   *
   * @param index - The zero-based position of the element to replace
   * @param value - The new value to set at the specified index
   * @returns A new LazyList with the element at the index replaced, or the same list if index is invalid
   */
  public set(index: number, value: T): LazyList<T> {
    if (index < 0) {
      return this;
    }

    const self = this;
    function* gen() {
      let currentIndex = 0;
      for (const next of self) {
        if (currentIndex === index) {
          yield value;
        } else {
          yield next;
        }
        currentIndex++;
      }
    }

    return new LazyList(gen());
  }

  /**
   * Inserts a new element at the specified index, shifting existing elements to the right.
   *
   * @param index - The zero-based position where the new element should be inserted
   * @param value - The value to insert
   * @returns A new LazyList with the value inserted at the specified position, or the same list if index is negative
   */
  public insert(index: number, value: T): LazyList<T> {
    if (index < 0) {
      return this;
    }

    if (index === 0) {
      // Prepend: new value becomes first element
      const self = this;
      function* gen() {
        yield value;
        for (const next of self) {
          yield next;
        }
      }
      return new LazyList(gen());
    }

    // Insert at position > 0
    const self = this;
    function* gen() {
      let currentIndex = 0;

      for (const next of self) {
        if (currentIndex === index) {
          yield value; // Insert the new value
        }
        yield next; // Then yield the current value
        currentIndex++;
      }

      // If index equals size, append at end
      if (currentIndex === index) {
        yield value;
      }
      // If index > size, nothing is inserted
    }

    return new LazyList(gen());
  }

  public append(value: T): LazyList<T> {
    const self = this;
    function* gen() {
      for (const next of self) {
        yield next;
      }
      yield value;
    }
    return new LazyList(gen());
  }

  public prepend(value: T): LazyList<T> {
    const self = this;
    function* gen() {
      yield value;
      for (const next of self) {
        yield next;
      }
    }
    return new LazyList(gen());
  }

  public concat(iterable: Iterable<T>): LazyList<T> {
    const self = this;
    function* gen() {
      for (const next of self) {
        yield next;
      }
      yield* iterable;
    }
    return new LazyList(gen());
  }

  public subtract(iterable: Iterable<T>): LazyList<T> {
    return this.filter((value) => !Iterable.includes(iterable, value));
  }

  public intersect(iterable: Iterable<T>): LazyList<T> {
    return this.filter((value) => Iterable.includes(iterable, value));
  }

  public tee<A extends Array<unknown> = []>(
    callback: Callback<LazyList<T>, void, [...args: A]>,
    ...args: A
  ): LazyList<T> {
    callback(this, ...args);
    return this;
  }

  public zip<U>(iterable: Iterable<U>): LazyList<[T, U]> {
    const self = this;
    function* gen() {
      const iterator = iterable[Symbol.iterator]();
      for (const value of self) {
        const next = iterator.next();
        if (next.done) {
          break;
        }
        yield [value, next.value] as [T, U];
      }
    }
    return new LazyList(gen());
  }

  public first(): Option<T> {
    for (const next of this) {
      return Option.of(next);
    }

    return None;
  }

  public last(): Option<T> {
    let last: Option<T> = None;
    for (const next of this) {
      last = Option.of(next);
    }
    return last;
  }

  public take(count: number): LazyList<T> {
    if (count <= 0) {
      return LazyList.empty();
    }

    const self = this;
    function* gen() {
      let taken = 0;
      for (const next of self) {
        if (taken >= count) {
          break;
        }
        yield next;
        taken++;
      }
    }
    return new LazyList(gen());
  }

  public takeUntil(predicate: Predicate<T, [index: number]>): LazyList<T> {
    const self = this;
    function* gen() {
      let index = 0;
      for (const value of self) {
        if (predicate(value, index++)) {
          break;
        }

        yield value;
      }
    }
    return new LazyList(gen());
  }

  public takeWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>,
  ): LazyList<U>;

  public takeWhile(predicate: Predicate<T, [index: number]>): LazyList<T>;

  public takeWhile(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.takeUntil(not(predicate));
  }

  /**
   * Returns the elements that precede the first element for which the
   * predicate returns `true`.
   *
   * @remarks
   * The result is in reverse order relative to the input (nearest-first).
   */
  public preceding(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.takeUntil(predicate).reverse();
  }

  public takeLast(count: number): LazyList<T> {
    if (count <= 0) {
      return LazyList.empty();
    }

    const self = this;
    function* gen() {
      const buffer: Array<T> = [];

      for (const value of self) {
        buffer.push(value);
        if (buffer.length > count) {
          buffer.shift(); // Remove the oldest element to maintain size
        }
      }

      // Yield all buffered elements
      yield* buffer;
    }
    return new LazyList(gen());
  }

  public takeLastWhile(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.reverse().takeWhile(predicate).reverse();
  }

  public takeLastUntil(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.takeLastWhile(not(predicate));
  }

  public skip(count: number): LazyList<T> {
    if (count <= 0) {
      return this;
    }

    const self = this;
    function* gen() {
      let skipped = 0;
      for (const next of self) {
        if (skipped < count) {
          skipped++;
          continue;
        }
        yield next;
      }
    }
    return new LazyList(gen());
  }

  public skipWhile(predicate: Predicate<T, [index: number]>): LazyList<T> {
    const self = this;
    function* gen() {
      let index = 0;
      let skipping = true;

      for (const value of self) {
        if (skipping && predicate(value, index)) {
          index++;
          continue;
        }

        skipping = false;
        yield value;
        index++;
      }
    }
    return new LazyList(gen());
  }

  public skipUntil(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.skipWhile(not(predicate));
  }

  public skipLast(count: number): LazyList<T> {
    if (count <= 0) {
      return this;
    }

    const self = this;
    function* gen() {
      const buffer: Array<T> = [];

      for (const value of self) {
        buffer.push(value);
        if (buffer.length > count) {
          yield buffer.shift()!; // Yield and remove the oldest element
        }
      }

      // Don't yield the remaining buffered elements (they are skipped)
    }
    return new LazyList(gen());
  }

  public skipLastWhile(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.reverse().skipWhile(predicate).reverse();
  }

  public skipLastUntil(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.skipLastWhile(not(predicate));
  }

  public trim(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.trimLeading(predicate).trimTrailing(predicate);
  }

  public trimLeading(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.skipWhile(predicate);
  }

  public trimTrailing(predicate: Predicate<T, [index: number]>): LazyList<T> {
    return this.skipLastWhile(predicate);
  }

  public rest(): LazyList<T> {
    return this.skip(1);
  }

  public slice(start: number, end?: number): LazyList<T> {
    if (start < 0) {
      start = 0;
    }

    const skipped = this.skip(start);

    if (end === undefined) {
      return skipped;
    }

    if (end <= start) {
      return LazyList.empty();
    }

    return skipped.take(end - start);
  }

  public reverse(): LazyList<T> {
    const self = this;
    function* gen() {
      const buffer: Array<T> = [];

      // Consume the entire list into a buffer
      for (const value of self) {
        buffer.push(value);
      }

      // Yield elements in reverse order
      for (let i = buffer.length - 1; i >= 0; i--) {
        yield buffer[i];
      }
    }
    return new LazyList(gen());
  }

  public join(separator: string): string {
    return Iterable.join(this, separator);
  }

  public sort<T extends Comparable<T>>(this: LazyList<T>): LazyList<T> {
    return this.sortWith(compareComparable);
  }

  public sortWith(comparer: Comparer<T>): LazyList<T> {
    const self = this;
    function* gen() {
      // Consume the entire list into a buffer
      const buffer: Array<T> = [];
      for (const value of self) {
        buffer.push(value);
      }

      // Sort the buffer using the provided comparer
      buffer.sort(comparer);

      // Yield the sorted elements
      yield* buffer;
    }
    return new LazyList(gen());
  }

  public compare<T>(
    this: LazyList<Comparable<T>>,
    iterable: Iterable<T>,
  ): Comparison {
    return this.compareWith(iterable, Comparable.compare);
  }

  public compareWith<U = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>,
  ): Comparison {
    return Iterable.compareWith(this, iterable, comparer);
  }

  public groupBy<K>(
    grouper: Mapper<T, K, [index: number]>,
  ): Map<K, LazyList<T>> {
    let groups = Map.empty<K, Array<T>>();
    let index = 0;

    // Group all elements into arrays by their key
    for (const value of this) {
      const key = grouper(value, index++);
      const group = groups.get(key);

      if (!group.isSome()) {
        groups = groups.set(key, [value]);
      } else {
        group.get().push(value);
      }
    }

    // Convert arrays to LazyLists
    let result = Map.empty<K, LazyList<T>>();
    for (const [key, values] of groups) {
      result = result.set(key, LazyList.from(values));
    }

    return result;
  }

  public equals(value: unknown): value is this {
    if (!LazyList.isLazyList(value)) {
      return false;
    }

    const iteratorA = this[Symbol.iterator]();
    const iteratorB = value[Symbol.iterator]();

    while (true) {
      const resultA = iteratorA.next();
      const resultB = iteratorB.next();

      // If both are done, lists are equal
      if (resultA.done && resultB.done) {
        return true;
      }

      // If only one is done, lists have different lengths
      if (resultA.done || resultB.done) {
        return false;
      }

      // Compare current elements
      if (!Equatable.equals(resultA.value, resultB.value)) {
        return false;
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

  public toArray(): Array<T> {
    const result: Array<T> = [];
    for (const value of this) {
      result.push(value);
    }
    return result;
  }

  public toJSON(options?: Serializable.Options): LazyList.JSON<T> {
    const json: LazyList.JSON<T> = [];
    for (const value of this) {
      json.push(Serializable.toJSON(value, options));
    }
    return json;
  }

  public toString(): string {
    return `LazyList [ ${this.join(", ")} ]`;
  }
}

/**
 * @public
 */
export namespace LazyList {
  export type JSON<T> = Collection.Indexed.JSON<T>;

  export function isLazyList<T>(value: Iterable<T>): value is LazyList<T>;

  export function isLazyList<T>(value: unknown): value is LazyList<T>;

  export function isLazyList<T>(value: unknown): value is LazyList<T> {
    return value instanceof LazyList;
  }
}
