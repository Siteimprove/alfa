import { Array } from "@siteimprove/alfa-array";
import { Callback } from "@siteimprove/alfa-callback";
import { Collection } from "@siteimprove/alfa-collection";
import { Comparable, Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Refinement } from "@siteimprove/alfa-refinement";

const { not } = Predicate;
const { compareComparable } = Comparable;

/**
 * @public
 */
export class Slice<T> implements Collection.Indexed<T> {
  public static of<T>(
    array: ReadonlyArray<T>,
    start: number = 0,
    end: number = array.length
  ): Slice<T> {
    start = clamp(start, array.length);

    return new Slice(array, start, clamp(end, array.length) - start);
  }

  private static _empty = new Slice([], 0, 0);

  public static empty<T>(): Slice<T> {
    return this._empty;
  }

  private readonly _array: ReadonlyArray<T>;
  private readonly _offset: number;
  private readonly _length: number;

  private constructor(array: ReadonlyArray<T>, offset: number, length: number) {
    this._array = array;
    this._offset = offset;
    this._length = length;
  }

  /**
   * @deprecated the array shouldn't be accessed directly
   */
  public get array(): ReadonlyArray<T> {
    return this._array;
  }

  public get offset(): number {
    return this._offset;
  }

  public get length(): number {
    return this._length;
  }

  public get size(): number {
    return this._length;
  }

  public isEmpty(): this is Slice<never> {
    return this._length === 0;
  }

  public forEach(callback: Callback<T, void, [index: number]>): void {
    Iterable.forEach(this, callback);
  }

  public map<U>(mapper: Mapper<T, U, [index: number]>): Slice<U> {
    const result = Array.allocate<U>(this._length);

    for (let i = 0, n = this._length; i < n; i++) {
      result[i] = mapper(this._array[this._offset + i], i);
    }

    return new Slice(result, 0, result.length);
  }

  public apply<U>(mapper: Slice<Mapper<T, U>>): Slice<U> {
    const array = [...Iterable.apply(this, mapper)];

    return new Slice(array, 0, array.length);
  }

  public flatMap<U>(mapper: Mapper<T, Slice<U>, [index: number]>): Slice<U> {
    const array = [...Iterable.flatMap(this, mapper)];

    return new Slice(array, 0, array.length);
  }

  public flatten<T>(this: Slice<Slice<T>>): Slice<T> {
    return this.flatMap((slice) => slice);
  }

  public reduce<U>(reducer: Reducer<T, U, [index: number]>, accumulator: U): U {
    return Iterable.reduce(this, reducer, accumulator);
  }

  public reduceWhile<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    return Iterable.reduceWhile(this, predicate, reducer, accumulator);
  }

  public reduceUntil<U>(
    predicate: Predicate<T, [index: number]>,
    reducer: Reducer<T, U, [index: number]>,
    accumulator: U
  ): U {
    return Iterable.reduceUntil(this, predicate, reducer, accumulator);
  }

  public filter<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Slice<U>;

  public filter(predicate: Predicate<T, [index: number]>): Slice<T>;

  public filter(predicate: Predicate<T, [index: number]>): Slice<T> {
    const array = [...Iterable.filter(this, predicate)];

    return new Slice(array, 0, array.length);
  }

  public reject<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Slice<Exclude<T, U>>;

  public reject(predicate: Predicate<T, [index: number]>): Slice<T>;

  public reject(predicate: Predicate<T, [index: number]>): Slice<T> {
    const array = [...Iterable.reject(this, predicate)];

    return new Slice(array, 0, array.length);
  }

  public find<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Option<U>;

  public find(predicate: Predicate<T, [index: number]>): Option<T>;

  public find(predicate: Predicate<T, [index: number]>): Option<T> {
    return Iterable.find(this, predicate);
  }

  public includes(value: T): boolean {
    return Iterable.includes(this, value);
  }

  public collect<U>(mapper: Mapper<T, Option<U>, [index: number]>): Slice<U> {
    const array = [...Iterable.collect(this, mapper)];

    return new Slice(array, 0, array.length);
  }

  public collectFirst<U>(
    mapper: Mapper<T, Option<U>, [index: number]>
  ): Option<U> {
    return Iterable.collectFirst(this, mapper);
  }

  public some(predicate: Predicate<T, [index: number]>): boolean {
    return Iterable.some(this, predicate);
  }

  public none(predicate: Predicate<T, [index: number]>): boolean {
    return Iterable.none(this, predicate);
  }

  public every(predicate: Predicate<T, [index: number]>): boolean {
    return Iterable.every(this, predicate);
  }

  public count(predicate: Predicate<T, [index: number]>): number {
    return Iterable.count(this, predicate);
  }

  public distinct(): Slice<T> {
    const array = [...Iterable.distinct(this)];

    return new Slice(array, 0, array.length);
  }

  public get(index: number): Option<T> {
    if (index < 0 || index >= this._length) {
      return None;
    }

    return Option.of(this._array[this._offset + index]);
  }

  public has(index: number): boolean {
    return index < 0 || index >= this._length;
  }

  public set(index: number, value: T): Slice<T> {
    if (index < 0 || index >= this._length) {
      return this;
    }

    const array = this.toArray();

    array[index] = value;

    return new Slice(array, 0, array.length);
  }

  public insert(index: number, value: T): Slice<T> {
    const array = Array.insert(this.toArray(), index, value);

    return new Slice(array, 0, array.length);
  }

  public append(value: T): Slice<T> {
    const array = Array.append(this.toArray(), value);

    return new Slice(array, 0, array.length);
  }

  public prepend(value: T): Slice<T> {
    const array = Array.prepend(this.toArray(), value);

    return new Slice(array, 0, array.length);
  }

  public concat(iterable: Iterable<T>): Slice<T> {
    const array = this.toArray();

    for (const value of iterable) {
      array.push(value);
    }

    return new Slice(array, 0, array.length);
  }

  public subtract(iterable: Iterable<T>): Slice<T> {
    const array = [...Iterable.subtract(this, iterable)];

    return new Slice(array, 0, array.length);
  }

  public intersect(iterable: Iterable<T>): Slice<T> {
    const array = [...Iterable.intersect(this, iterable)];

    return new Slice(array, 0, array.length);
  }

  public tee<A extends Array<unknown> = []>(
    callback: Callback<this, void, [...args: A]>,
    ...args: A
  ): this {
    callback(this, ...args);
    return this;
  }

  public zip<U>(iterable: Iterable<U>): Slice<[T, U]> {
    const array = [...Iterable.zip(this, iterable)];

    return new Slice(array, 0, array.length);
  }

  public first(): Option<T> {
    return this.get(0);
  }

  public last(): Option<T> {
    return this.get(this._length - 1);
  }

  public take(count: number): Slice<T> {
    return this.slice(0, count);
  }

  public takeWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Slice<U>;

  public takeWhile(predicate: Predicate<T, [index: number]>): Slice<T>;

  public takeWhile(predicate: Predicate<T, [index: number]>): Slice<T> {
    let count = 0;

    for (let i = 0, n = this._length; i < n; i++) {
      if (predicate(this._array[this._offset + i], i)) {
        count++;
      } else {
        break;
      }
    }

    return this.take(count);
  }

  public takeUntil(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.takeWhile(not(predicate));
  }

  public takeLast(count: number): Slice<T> {
    return this.slice(this._length - count);
  }

  public takeLastWhile<U extends T>(
    refinement: Refinement<T, U, [index: number]>
  ): Slice<U>;

  public takeLastWhile(predicate: Predicate<T, [index: number]>): Slice<T>;

  public takeLastWhile(predicate: Predicate<T, [index: number]>): Slice<T> {
    let count = 0;

    for (let i = this._length - 1; i >= 0; i--) {
      if (predicate(this._array[this._offset + i], i)) {
        count++;
      } else {
        break;
      }
    }

    return this.takeLast(count);
  }

  public takeLastUntil(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.takeLastWhile(not(predicate));
  }

  public skip(count: number): Slice<T> {
    return this.slice(count);
  }

  public skipWhile(predicate: Predicate<T, [index: number]>): Slice<T> {
    let count = 0;

    for (let i = 0, n = this._length; i < n; i++) {
      if (predicate(this._array[this._offset + i], i)) {
        count++;
      } else {
        break;
      }
    }

    return this.skip(count);
  }

  public skipUntil(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.skipWhile(not(predicate));
  }

  public skipLast(count: number): Slice<T> {
    return this.slice(0, this._length - count);
  }

  public skipLastWhile(predicate: Predicate<T, [index: number]>): Slice<T> {
    let count = 0;

    for (let i = this._length - 1; i >= 0; i--) {
      if (predicate(this._array[this._offset + i], i)) {
        count++;
      } else {
        break;
      }
    }

    return this.skipLast(count);
  }

  public skipLastUntil(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.skipLastWhile(not(predicate));
  }

  public trim(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.trimLeading(predicate).trimTrailing(predicate);
  }

  public trimLeading(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.skipWhile(predicate);
  }

  public trimTrailing(predicate: Predicate<T, [index: number]>): Slice<T> {
    return this.skipLastWhile(predicate);
  }

  public rest(): Slice<T> {
    return this.slice(1);
  }

  public slice(start: number, end: number = this._length): Slice<T> {
    start = clamp(start, this._length);

    return new Slice(
      this._array,
      this._offset + start,
      clamp(end, this._length) - start
    );
  }

  public reverse(): Slice<T> {
    const array = this.toArray().reverse();

    return new Slice(array, 0, array.length);
  }

  public join(separator: string): string {
    return Iterable.join(this, separator);
  }

  public sort<T extends Comparable<T>>(this: Slice<T>): Slice<T> {
    return this.sortWith(compareComparable);
  }

  public sortWith(comparer: Comparer<T>): Slice<T>;

  public sortWith<T, U extends T = T>(
    this: Slice<U>,
    comparer: Comparer<T>
  ): Slice<U>;

  public sortWith(comparer: Comparer<T>): Slice<T> {
    const array = Array.sortWith(this.toArray(), comparer);

    return new Slice(array, 0, array.length);
  }

  public compare<T>(
    this: Slice<Comparable<T>>,
    iterable: Iterable<T>
  ): Comparison {
    return this.compareWith(iterable, compareComparable);
  }

  public compareWith<U = T>(
    iterable: Iterable<U>,
    comparer: Comparer<T, U, [index: number]>
  ): Comparison {
    return Iterable.compareWith(this, iterable, comparer);
  }

  public *iterator(): Iterator<T> {
    for (let i = this._offset, n = i + this._length; i < n; i++) {
      yield this._array[i];
    }
  }

  public [Symbol.iterator](): Iterator<T> {
    return this.iterator();
  }

  public equals<T>(value: Slice<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    if (value instanceof Slice && value._length === this._length) {
      for (let i = 0, n = value._length; i < n; i++) {
        if (
          !Equatable.equals(
            value._array[value._offset + i],
            this._array[this._offset + i]
          )
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  public hash(hash: Hash): void {
    Iterable.hash(this, hash);
  }

  public toArray(): Array<T> {
    return this._array.slice(this._offset, this._offset + this._length);
  }

  public toJSON(): Slice.JSON<T> {
    return this.toArray().map((value) => Serializable.toJSON(value));
  }

  public toString(): string {
    const values = this.toArray().join(", ");

    return `Slice [${values === "" ? "" : ` ${values} `}]`;
  }
}

/**
 * @public
 */
export namespace Slice {
  export type JSON<T> = Array<Serializable.ToJSON<T>>;

  export function from<T>(iterable: Iterable<T>): Slice<T> {
    if (isSlice(iterable)) {
      return iterable;
    }

    return Slice.of([...iterable]);
  }

  export function isSlice<T>(value: Iterable<T>): value is Slice<T>;

  export function isSlice<T>(value: unknown): value is Slice<T>;

  export function isSlice<T>(value: unknown): value is Slice<T> {
    return value instanceof Slice;
  }
}

function clamp(value: number, length: number): number {
  return value < 0 ? 0 : value > length ? length : value;
}
